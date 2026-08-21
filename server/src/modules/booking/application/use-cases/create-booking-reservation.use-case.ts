import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IStationPricingRepository } from "@/modules/station/domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "@/modules/station/domain/repositories/extra-service.repository"
import { ITimeWindowRepository } from "@/modules/station/domain/repositories/time-window.repository"
import { IVehicleRepository } from "@/modules/vehicle/domain/repositories/vehicle.repository"
import { IWalletRepository } from "@/modules/wallet/domain/repositories/wallet.repository.interface"
import { StationStatus } from "@/modules/station/domain/entities/Station"
import { ServiceType, PaymentMethod } from "../../domain/entities/Booking"
import { BookingPricingService } from "../../domain/services/BookingPricingService"
import { BookingReservation } from "../../domain/entities/BookingReservation"
import { IBookingReservationRepository } from "../../domain/repositories/booking-reservation.repository"
import { ICreateBookingReservationUseCase } from "../interfaces/booking-usecases.interface"
import { BookingPricingResolutionService } from "../services/booking-pricing-resolution.service"
import { IPaymentGatewayService } from "../interfaces/payment-gateway.interface"

export interface CreateBookingReservationInput {
  stationId: string
  vehicleId: string
  timeWindowId: string
  serviceType: "HALF" | "FULL"
  extraServiceIds?: string[]
  paymentMethod: "ONLINE" | "PAY_AT_STATION"
  useWallet?: boolean
}

export interface BookingReservationResponseDTO {
  reservationId: string
  paymentOrderId: string
  amount: number
  walletAmount?: number
  currency: string
  expiresAt: string
}

export class CreateBookingReservationUseCase implements ICreateBookingReservationUseCase {
  private readonly pricingResolutionService: BookingPricingResolutionService

  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository,
    private readonly timeWindowRepository: ITimeWindowRepository,
    private readonly vehicleRepository: IVehicleRepository,
    private readonly reservationRepository: IBookingReservationRepository,
    private readonly paymentGateway: IPaymentGatewayService,
    private readonly walletRepository: IWalletRepository
  ) {
    this.pricingResolutionService = new BookingPricingResolutionService(
      stationPricingRepository,
      extraServiceRepository
    )
  }

  async execute(
    userId: string,
    input: CreateBookingReservationInput
  ): Promise<BookingReservationResponseDTO> {
    // 1. Validate Station
    const station = await this.stationRepository.findById(input.stationId)
    if (!station) {
      throw new AppError("Station not found", HTTP_STATUS.NOT_FOUND)
    }

    if (station.status !== StationStatus.ACTIVE || !station.getProps().isActive) {
      throw new AppError("Station is currently inactive or suspended", HTTP_STATUS.BAD_REQUEST)
    }

    // 2. Validate Vehicle
    const vehicle = await this.vehicleRepository.findById(input.vehicleId)
    if (!vehicle || vehicle.userId !== userId || !vehicle.data.isActive) {
      throw new AppError("Vehicle not found or does not belong to user", HTTP_STATUS.BAD_REQUEST)
    }

    // 3 & 4. Resolve pricing for vehicle class and validate/price extra services
    const { basePrice, selectedExtraServices } = await this.pricingResolutionService.resolve(
      station.id,
      vehicle.data.classId,
      input.serviceType,
      input.extraServiceIds
    )

    // 5. Validate Time Window
    const timeWindow = await this.timeWindowRepository.findById(input.timeWindowId)
    if (!timeWindow || timeWindow.stationId !== station.id) {
      throw new AppError("Selected time window not found", HTTP_STATUS.NOT_FOUND)
    }

    timeWindow.updateStatusBasedOnTimeAndCapacity()
    if (!timeWindow.isBookable) {
      throw new AppError("SLOT_UNAVAILABLE", HTTP_STATUS.CONFLICT)
    }

    // 6. ATOMICALLY Reserve Slot Capacity BEFORE creating Payment Order
    const reservedWindow = await this.timeWindowRepository.reserveCapacityAtomically(timeWindow.id)
    if (!reservedWindow) {
      throw new AppError("SLOT_UNAVAILABLE", HTTP_STATUS.CONFLICT)
    }

    // 7. Calculate Pricing & Settlement
    const pricingResult = BookingPricingService.calculate({
      basePrice,
      extraServices: selectedExtraServices,
      paymentMethod:
        input.paymentMethod === "PAY_AT_STATION"
          ? PaymentMethod.PAY_AT_STATION
          : PaymentMethod.ONLINE,
      isWalkIn: false,
    })

    const fullPayableAmountRupees =
      input.paymentMethod === "ONLINE"
        ? pricingResult.pricingSnapshot.totalPrice
        : pricingResult.depositAmount

    // Check if wallet balance should be applied
    let walletAmountToDeduct = 0
    let payableAmountRupees = fullPayableAmountRupees

    if (input.useWallet && input.paymentMethod === "ONLINE") {
      const userWallet = await this.walletRepository.findByUserId(userId)
      if (userWallet && userWallet.balance.amount > 0) {
        walletAmountToDeduct = Math.min(userWallet.balance.amount, fullPayableAmountRupees)
        payableAmountRupees = Math.max(0, fullPayableAmountRupees - walletAmountToDeduct)
      }
    }

    const payableAmountPaise = Math.round(payableAmountRupees * 100)

    // 8. Create Payment Order via abstracted payment gateway
    let paymentOrderId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    if (payableAmountPaise >= 100) {
      try {
        const order = await this.paymentGateway.createOrder({
          amountInPaise: payableAmountPaise,
          currency: "INR",
        })
        paymentOrderId = order.orderId
      } catch (err: unknown) {
        // Rollback capacity if payment order creation fails
        await this.timeWindowRepository.releaseCapacityAtomically(timeWindow.id)
        const message = err instanceof Error ? err.message : "Failed to create payment order"
        throw new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
    }

    // 9. Save Reservation with 10 minute expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const reservation = new BookingReservation({
      id: "",
      userId,
      stationId: station.id,
      vehicleId: vehicle.id,
      timeWindowId: timeWindow.id,
      serviceType: input.serviceType === "FULL" ? ServiceType.FULL : ServiceType.HALF,
      extraServiceIds: input.extraServiceIds || [],
      paymentMethod:
        input.paymentMethod === "PAY_AT_STATION"
          ? PaymentMethod.PAY_AT_STATION
          : PaymentMethod.ONLINE,
      depositAmount: pricingResult.depositAmount,
      cashAmount: pricingResult.cashAmount,
      totalAmount: pricingResult.pricingSnapshot.totalPrice,
      walletAmount: walletAmountToDeduct,
      paymentOrderId,
      status: "HELD",
      expiresAt,
    })

    const savedReservation = await this.reservationRepository.save(reservation)

    return {
      reservationId: savedReservation.id,
      paymentOrderId,
      amount: payableAmountPaise,
      walletAmount: walletAmountToDeduct,
      currency: "INR",
      expiresAt: expiresAt.toISOString(),
    }
  }
}
