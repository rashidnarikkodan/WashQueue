import crypto from "crypto"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import env from "@/configs/env.config"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IStationPricingRepository } from "@/modules/station/domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "@/modules/station/domain/repositories/extra-service.repository"
import { ITimeWindowRepository } from "@/modules/station/domain/repositories/time-window.repository"
import { IVehicleRepository } from "@/modules/vehicle/domain/repositories/vehicle.repository"
import { Booking, BookingStatus, PaymentStatus } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { BookingNumberService } from "../../domain/services/BookingNumberService"
import { QRTokenService } from "../../domain/services/QRTokenService"
import { BookingPricingService } from "../../domain/services/BookingPricingService"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { BookingNotificationService } from "../../infrastructure/services/booking-notification.service"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { IBookingReservationRepository } from "../../domain/repositories/booking-reservation.repository"

export interface ConfirmBookingReservationInput {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export class ConfirmBookingReservationUseCase {
  constructor(
    private readonly reservationRepository: IBookingReservationRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly stationRepository: IStationRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository,
    private readonly timeWindowRepository: ITimeWindowRepository,
    private readonly vehicleRepository: IVehicleRepository,
    private readonly notificationService: BookingNotificationService
  ) {}

  async execute(input: ConfirmBookingReservationInput): Promise<BookingResponseDTO> {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input

    // 1. Verify Razorpay HMAC Signature
    const generatedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf-8"),
      Buffer.from(razorpay_signature, "utf-8")
    )

    if (!isMatch) {
      throw new AppError("Payment signature mismatch. Verification failed.", HTTP_STATUS.BAD_REQUEST)
    }

    // 2. Find Reservation
    const reservation = await this.reservationRepository.findByRazorpayOrderId(razorpay_order_id)
    if (!reservation) {
      throw new AppError("Reservation not found for order", HTTP_STATUS.NOT_FOUND)
    }

    // 3. Idempotency Check: Already Confirmed
    if (reservation.status === "CONFIRMED" && reservation.bookingId) {
      const existingBooking = await this.bookingRepository.findById(reservation.bookingId)
      if (existingBooking) {
        return BookingDTOMapper.toDTO(existingBooking)
      }
    }

    // 4. Handle Expired or Released Reservation Payment
    if (reservation.status === "RELEASED" || reservation.status === "EXPIRED_REFUND_NEEDED" || reservation.isExpired) {
      reservation.markExpiredRefund(razorpay_payment_id)
      await this.reservationRepository.save(reservation)
      throw new AppError(
        "RESERVATION_EXPIRED_REFUND_INITIATED",
        HTTP_STATUS.BAD_REQUEST,
        "Your payment succeeded, but the 10-minute hold expired. A refund has been automatically initiated for your payment."
      )
    }

    // 5. Convert HELD Reservation to CONFIRMED Booking
    const station = await this.stationRepository.findById(reservation.stationId)
    const vehicle = await this.vehicleRepository.findById(reservation.vehicleId)
    const timeWindow = await this.timeWindowRepository.findById(reservation.timeWindowId)

    if (!station || !vehicle || !timeWindow) {
      reservation.markExpiredRefund(razorpay_payment_id)
      await this.reservationRepository.save(reservation)
      throw new AppError(
        "RESERVATION_EXPIRED_REFUND_INITIATED",
        HTTP_STATUS.BAD_REQUEST,
        "Booking details could not be resolved. A refund has been automatically initiated."
      )
    }

    const pricings = await this.stationPricingRepository.findByStationId(station.id)
    const pricing = pricings.find((p) => p.vehicleClassId === vehicle.data.classId && p.isActive)
    const basePrice = pricing
      ? reservation.serviceType === "FULL"
        ? pricing.fullWashPrice
        : pricing.halfWashPrice
      : 0

    const availableExtras = await this.extraServiceRepository.findByStationId(station.id)
    const selectedExtraServices: Array<{ serviceId: string; name: string; price: number }> = []

    for (const extraId of reservation.extraServiceIds) {
      const extra = availableExtras.find((e) => e.id === extraId && e.isActive)
      if (extra) {
        const classPricing = extra.pricing.find((p) => p.vehicleClassId === vehicle.data.classId)
        selectedExtraServices.push({
          serviceId: extra.id,
          name: extra.name,
          price: classPricing ? classPricing.price : 0,
        })
      }
    }

    const pricingResult = BookingPricingService.calculate({
      basePrice,
      extraServices: selectedExtraServices,
      paymentType: reservation.paymentType,
    })

    const bookingNumber = BookingNumberService.generate()
    const qrResult = QRTokenService.generateToken(timeWindow.windowEnd)
    const now = new Date()

    const booking = new Booking({
      id: "",
      bookingNumber,
      userId: reservation.userId,
      providerId: station.ownerId && station.ownerId.length > 0 ? station.ownerId : reservation.userId,
      stationId: station.id,
      vehicleId: vehicle.id,
      vehicleSnapshot: {
        vehicleCategoryId: vehicle.data.categoryId,
        vehicleClassId: vehicle.data.classId,
      },
      serviceType: reservation.serviceType,
      pricingSnapshot: pricingResult.pricingSnapshot,
      extraServices: selectedExtraServices,
      scheduling: {
        timeWindowId: timeWindow.id,
        windowStart: timeWindow.windowStart,
        windowEnd: timeWindow.windowEnd,
      },
      isWalkIn: false,
      createdByUserId: reservation.userId,
      qr: {
        qrTokenHash: qrResult.qrTokenHash,
        qrExpiresAt: qrResult.qrExpiresAt,
      },
      paymentStatus:
        reservation.paymentType === "ONLINE_FULL" ? PaymentStatus.PAID : PaymentStatus.PENDING,
      paymentType: reservation.paymentType,
      depositAmount: pricingResult.depositAmount,
      cashAmount: pricingResult.cashAmount,
      refundAmount: 0,
      settlement: pricingResult.settlement,
      status: BookingStatus.CONFIRMED,
      createdAt: now,
      updatedAt: now,
    })

    const savedBooking = await this.bookingRepository.save(booking)

    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: savedBooking.id,
      fromStatus: null,
      toStatus: BookingStatus.CONFIRMED,
      changedBy: reservation.userId,
      reason: "Customer confirmed booking after payment verification",
      createdAt: now,
    })
    await this.bookingStatusLogRepository.save(statusLog)

    // Update reservation status to CONFIRMED
    reservation.confirm(savedBooking.id, razorpay_payment_id, razorpay_signature)
    await this.reservationRepository.save(reservation)

    // Notify
    await this.notificationService.notify("BOOKING_CREATED", savedBooking)

    return BookingDTOMapper.toDTO(savedBooking, qrResult.rawToken)
  }
}
