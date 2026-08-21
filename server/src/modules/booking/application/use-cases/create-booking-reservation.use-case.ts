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
    const station = await this.stationRepository.findById(input.stationId)
    if (!station) {
      throw new AppError("Station not found", HTTP_STATUS.NOT_FOUND)
    }

    if (station.status !== StationStatus.ACTIVE || !station.getProps().isActive) {
      throw new AppError("Station is currently inactive or suspended", HTTP_STATUS.BAD_REQUEST)
    }

    const vehicle = await this.vehicleRepository.findById(input.vehicleId)
    if (!vehicle || vehicle.userId !== userId || !vehicle.data.isActive) {
      throw new AppError("Vehicle not found or does not belong to user", HTTP_STATUS.BAD_REQUEST)
    }

    const { basePrice, selectedExtraServices } = await this.pricingResolutionService.resolve(
      station.id,
      vehicle.data.classId,
      input.serviceType,
      input.extraServiceIds
    )

    const timeWindow = await this.timeWindowRepository.findById(input.timeWindowId)
    if (!timeWindow || timeWindow.stationId !== station.id) {
      throw new AppError("Selected time window not found", HTTP_STATUS.NOT_FOUND)
    }

    timeWindow.updateStatusBasedOnTimeAndCapacity()
    if (!timeWindow.isBookable) {
      throw new AppError("SLOT_UNAVAILABLE", HTTP_STATUS.CONFLICT)
    }

    const reservedWindow = await this.timeWindowRepository.reserveCapacityAtomically(timeWindow.id)
    if (!reservedWindow) {
      throw new AppError("SLOT_UNAVAILABLE", HTTP_STATUS.CONFLICT)
    }

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

    let paymentOrderId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    if (payableAmountPaise >= 100) {
      try {
        const order = await this.paymentGateway.createOrder({
          amountInPaise: payableAmountPaise,
          currency: "INR",
        })
        paymentOrderId = order.orderId
      } catch (err: unknown) {
        await this.timeWindowRepository.releaseCapacityAtomically(timeWindow.id)
        const message = err instanceof Error ? err.message : "Failed to create payment order"
        throw new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR)
      }
    }

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
