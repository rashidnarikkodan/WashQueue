import Razorpay from "razorpay"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import env from "@/configs/env.config"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IStationPricingRepository } from "@/modules/station/domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "@/modules/station/domain/repositories/extra-service.repository"
import { ITimeWindowRepository } from "@/modules/station/domain/repositories/time-window.repository"
import { IVehicleRepository } from "@/modules/vehicle/domain/repositories/vehicle.repository"
import { StationStatus } from "@/modules/station/domain/entities/Station"
import { ServiceType, PaymentType } from "../../domain/entities/Booking"
import { BookingPricingService } from "../../domain/services/BookingPricingService"
import { BookingReservation } from "../../domain/entities/BookingReservation"
import { IBookingReservationRepository } from "../../domain/repositories/booking-reservation.repository"

export interface CreateBookingReservationInput {
  stationId: string
  vehicleId: string
  timeWindowId: string
  serviceType: "HALF" | "FULL"
  extraServiceIds?: string[]
  paymentType: "ONLINE_FULL" | "PAY_AT_STATION"
}

export interface BookingReservationResponseDTO {
  reservationId: string
  razorpayOrderId: string
  amount: number
  currency: string
  expiresAt: string
}

import { ICreateBookingReservationUseCase } from "../interfaces/booking-usecases.interface"
import { BookingPricingResolutionService } from "../services/booking-pricing-resolution.service"

export class CreateBookingReservationUseCase implements ICreateBookingReservationUseCase {
  private razorpay: Razorpay
  private readonly pricingResolutionService: BookingPricingResolutionService

  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository,
    private readonly timeWindowRepository: ITimeWindowRepository,
    private readonly vehicleRepository: IVehicleRepository,
    private readonly reservationRepository: IBookingReservationRepository
  ) {
    this.razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    })
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
      throw new AppError(
        "SLOT_UNAVAILABLE",
        HTTP_STATUS.CONFLICT
      )
    }

    // 6. ATOMICALLY Reserve Slot Capacity BEFORE creating Razorpay Order
    const reservedWindow = await this.timeWindowRepository.reserveCapacityAtomically(timeWindow.id)
    if (!reservedWindow) {
      throw new AppError(
        "SLOT_UNAVAILABLE",
        HTTP_STATUS.CONFLICT
      )
    }

    // 7. Calculate Pricing & Settlement
    const pricingResult = BookingPricingService.calculate({
      basePrice,
      extraServices: selectedExtraServices,
      paymentType:
        input.paymentType === "PAY_AT_STATION"
          ? PaymentType.DEPOSIT_PLUS_CASH
          : PaymentType.ONLINE_FULL,
    })

    const payableAmountRupees =
      input.paymentType === "ONLINE_FULL"
        ? pricingResult.pricingSnapshot.totalPrice
        : pricingResult.depositAmount

    const payableAmountPaise = Math.round(payableAmountRupees * 100)

    // 8. Create Razorpay Order
    let razorpayOrderId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    if (payableAmountPaise >= 100) {
      try {
        const order = await this.razorpay.orders.create({
          amount: payableAmountPaise,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
        })
        razorpayOrderId = order.id
      } catch (err: unknown) {
        // Rollback capacity if Razorpay order creation fails
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
      paymentType:
        input.paymentType === "PAY_AT_STATION"
          ? PaymentType.DEPOSIT_PLUS_CASH
          : PaymentType.ONLINE_FULL,
      depositAmount: pricingResult.depositAmount,
      cashAmount: pricingResult.cashAmount,
      totalAmount: pricingResult.pricingSnapshot.totalPrice,
      razorpayOrderId,
      status: "HELD",
      expiresAt,
    })

    const savedReservation = await this.reservationRepository.save(reservation)

    return {
      reservationId: savedReservation.id,
      razorpayOrderId,
      amount: payableAmountPaise,
      currency: "INR",
      expiresAt: expiresAt.toISOString(),
    }
  }
}
