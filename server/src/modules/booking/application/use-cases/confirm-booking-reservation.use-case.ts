import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IStationPricingRepository } from "@/modules/station/domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "@/modules/station/domain/repositories/extra-service.repository"
import { ITimeWindowRepository } from "@/modules/station/domain/repositories/time-window.repository"
import { IVehicleRepository } from "@/modules/vehicle/domain/repositories/vehicle.repository"
import {
  Booking,
  BookingStatus,
  PaymentMethod,
  derivePaymentStatus,
  deriveOnlinePaymentMethod,
} from "../../domain/entities/Booking"
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
  paymentMethod?: PaymentMethod
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

    const isWalletPayment = paymentMethod === PaymentMethod.WALLET

    if (!isWalletPayment && !input.skipSignatureVerification) {
      const isMatch = this.paymentGateway.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      )

      if (!isMatch) {
        throw new AppError("Payment signature mismatch. Verification failed.", HTTP_STATUS.BAD_REQUEST)
      }
    }

    const reservation = await this.reservationRepository.findByRazorpayOrderId(razorpay_order_id)
    if (!reservation) {
      throw new AppError("Reservation not found for order", HTTP_STATUS.NOT_FOUND)
    }

    if (reservation.status === "CONFIRMED" && reservation.bookingId) {
      const existingBooking = await this.bookingRepository.findById(reservation.bookingId)
      if (existingBooking) {
        return BookingDTOMapper.toDTO(existingBooking)
      }
    }

    if (reservation.status === "RELEASED" || reservation.status === "EXPIRED_REFUND_NEEDED" || reservation.isExpired) {
      reservation.markExpiredRefund(razorpay_payment_id)
      await this.reservationRepository.save(reservation)
      throw new AppError(
        "RESERVATION_EXPIRED_REFUND_INITIATED",
        HTTP_STATUS.BAD_REQUEST,
        "Your payment succeeded, but the 10-minute hold expired. A refund has been automatically initiated for your payment."
      )
    }

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
      paymentMethod: reservation.paymentMethod,
      isWalkIn: false,
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
      paymentStatus: derivePaymentStatus(reservation.paymentMethod, false),
      paymentMethod:
        reservation.paymentMethod === PaymentMethod.PAY_AT_STATION
          ? PaymentMethod.PAY_AT_STATION
          : deriveOnlinePaymentMethod({ isWalletPayment, walletAmount: reservation.walletAmount }),
      depositAmount: pricingResult.depositAmount,
      cashAmount: pricingResult.cashAmount,
      refundAmount: 0,
      settlement: pricingResult.settlement,
      status: BookingStatus.CONFIRMED,
      createdAt: now,
      updatedAt: now,
    })

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

    await this.notificationService.notify("BOOKING_CREATED", savedBooking)

    return BookingDTOMapper.toDTO(savedBooking, qrResult.rawToken)
  }
}
