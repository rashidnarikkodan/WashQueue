import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IStationPricingRepository } from "@/modules/station/domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "@/modules/station/domain/repositories/extra-service.repository"
import { ITimeWindowRepository } from "@/modules/station/domain/repositories/time-window.repository"
import { IVehicleRepository } from "@/modules/vehicle/domain/repositories/vehicle.repository"
import { Booking, BookingStatus, PaymentStatus, PaymentType } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { BookingNumberService } from "../../domain/services/BookingNumberService"
import { QRTokenService } from "../../domain/services/QRTokenService"
import { BookingPricingService } from "../../domain/services/BookingPricingService"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { IBookingReservationRepository } from "../../domain/repositories/booking-reservation.repository"
import { IPaymentGatewayService } from "../interfaces/payment-gateway.interface"
import { DebitWalletUseCase } from "@/modules/wallet/application/use-cases/debit-wallet.use-case"
import { ITransactionRunner } from "@/core/domain/transaction.interface"
import logger from "@/configs/logger.config"

export interface ConfirmBookingReservationInput {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  paymentMethod?: "RAZORPAY" | "WALLET"
  /**
   * Set only by the Razorpay webhook flow, which has already authenticated the
   * request via its own x-razorpay-signature payload HMAC (a different signature
   * than the checkout-flow order/payment HMAC checked below).
   */
  skipSignatureVerification?: boolean
}

import { IConfirmBookingReservationUseCase } from "../interfaces/booking-usecases.interface"
import { BookingPricingResolutionService } from "../services/booking-pricing-resolution.service"

export class ConfirmBookingReservationUseCase implements IConfirmBookingReservationUseCase {
  private readonly pricingResolutionService: BookingPricingResolutionService

  constructor(
    private readonly reservationRepository: IBookingReservationRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly stationRepository: IStationRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository,
    private readonly timeWindowRepository: ITimeWindowRepository,
    private readonly vehicleRepository: IVehicleRepository,
    private readonly notificationService: IBookingNotificationService,
    private readonly paymentGateway: IPaymentGatewayService,
    private readonly debitWalletUseCase: DebitWalletUseCase,
    private readonly transactionRunner?: ITransactionRunner
  ) {
    this.pricingResolutionService = new BookingPricingResolutionService(
      stationPricingRepository,
      extraServiceRepository
    )
  }

  async execute(input: ConfirmBookingReservationInput): Promise<BookingResponseDTO> {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentMethod } = input

    const isWalletPayment = paymentMethod === "WALLET"

    if (!isWalletPayment && !input.skipSignatureVerification) {
      // Verify Razorpay HMAC Signature for online card/UPI payments
      const isMatch = this.paymentGateway.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      )

      if (!isMatch) {
        throw new AppError("Payment signature mismatch. Verification failed.", HTTP_STATUS.BAD_REQUEST)
      }
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

    // strict=false: extras were already validated when the reservation was created, so a
    // since-removed/deactivated extra is silently dropped here rather than blocking confirmation.
    const { basePrice, selectedExtraServices } = await this.pricingResolutionService.resolve(
      station.id,
      vehicle.data.classId,
      reservation.serviceType,
      reservation.extraServiceIds,
      false
    )

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
        reservation.paymentType === PaymentType.ONLINE_FULL ? PaymentStatus.PAID : PaymentStatus.PENDING,
      paymentType: reservation.paymentType,
      depositAmount: pricingResult.depositAmount,
      cashAmount: pricingResult.cashAmount,
      refundAmount: 0,
      settlement: pricingResult.settlement,
      status: BookingStatus.CONFIRMED,
      createdAt: now,
      updatedAt: now,
    })

    // Booking creation, its audit log, and the reservation's CONFIRMED transition are one
    // atomic unit — a manager should never see a half-confirmed reservation with no booking,
    // or a booking with no audit trail, because one write in the sequence failed.
    const runConfirmationWork = async (session?: unknown) => {
      const savedBooking = await this.bookingRepository.save(booking, session)

      const statusLog = new BookingStatusLog({
        id: "",
        bookingId: savedBooking.id,
        fromStatus: null,
        toStatus: BookingStatus.CONFIRMED,
        changedBy: reservation.userId,
        reason: "Customer confirmed booking after payment verification",
        createdAt: now,
      })
      await this.bookingStatusLogRepository.save(statusLog, session)

      reservation.confirm(savedBooking.id, razorpay_payment_id, razorpay_signature)
      await this.reservationRepository.save(reservation, session)

      return savedBooking
    }

    const savedBooking = this.transactionRunner
      ? await this.transactionRunner.runInTransaction(runConfirmationWork)
      : await runConfirmationWork()

    // Deduct wallet balance if split payment was used. This is a best-effort side payment on
    // top of an already-committed booking (the wallet module manages its own transaction and
    // can't join the one above), so a failure here must not undo the confirmed booking — it's
    // logged for manual reconciliation instead of being silently swallowed.
    if (reservation.walletAmount > 0) {
      try {
        await this.debitWalletUseCase.execute({
          userId: reservation.userId,
          amount: reservation.walletAmount,
          category: "BOOKING_PAYMENT",
          description: `Partial wallet payment for booking ${bookingNumber}`,
          referenceId: savedBooking.id,
          metadata: {
            bookingId: savedBooking.id,
            reservationId: reservation.id,
            razorpayOrderId: razorpay_order_id,
          },
        })
      } catch (walletErr) {
        logger.error(
          {
            error: walletErr,
            bookingId: savedBooking.id,
            reservationId: reservation.id,
            walletAmount: reservation.walletAmount,
          },
          "[ConfirmBookingReservation] Wallet debit failed after booking was confirmed — needs manual reconciliation"
        )
      }
    }

    // Notify
    await this.notificationService.notify("BOOKING_CREATED", savedBooking)

    return BookingDTOMapper.toDTO(savedBooking, qrResult.rawToken)
  }
}
