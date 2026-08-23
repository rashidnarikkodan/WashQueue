import { IValidateQRForCheckInUseCase } from "../interfaces/queue-usecases.interface"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import logger from "@/configs/logger.config"
import { BookingStatus, PaymentStatus, PaymentMethod } from "@/modules/booking/domain/entities/Booking"
import { IBookingRepository } from "@/modules/booking/domain/repositories/booking.repository"
import { QRTokenService } from "@/modules/booking/domain/services/QRTokenService"
import { BookingDTOMapper } from "@/modules/booking/application/mappers/booking-dto.mapper"
import { CheckInBookingInput } from "../dtos/checkin-booking.dto"
import { BookingResponseDTO } from "@/modules/booking/application/dtos/booking-response.dto"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IBookingStatusLogRepository } from "@/modules/booking/domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "@/modules/booking/domain/entities/BookingStatusLog"
import { IBookingNotificationService } from "@/modules/notification/notification.module"

export class ValidateQRForCheckInUseCase implements IValidateQRForCheckInUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly managerAssignmentRepository: IManagerAssignmentRepository,
    private readonly stationRepository: IStationRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly notificationService: IBookingNotificationService
  ) {}

  async execute(managerUserId: string, input: CheckInBookingInput): Promise<BookingResponseDTO> {
    let searchStr = (input.qrToken || input.bookingId || "").trim().replace(/^#+\s*/, "")

    if (!searchStr) {
      throw new AppError("QR token or Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    if (searchStr.startsWith("{") && searchStr.endsWith("}")) {
      try {
        const parsed = JSON.parse(searchStr)
        if (parsed.rawQrToken) {
          searchStr = parsed.rawQrToken
        } else if (parsed.bookingNumber) {
          searchStr = parsed.bookingNumber
        } else if (parsed.id) {
          searchStr = parsed.id
        }
      } catch {
      }
    }

    let booking = null

    try {
      const qrHash = QRTokenService.hashToken(searchStr)
      booking = await this.bookingRepository.findByQrTokenHash(qrHash)
    } catch {
    }

    if (!booking) {
      booking = await this.bookingRepository.findByBookingNumber(searchStr)
    }

    if (!booking && !searchStr.toUpperCase().startsWith("WQ-")) {
      booking = await this.bookingRepository.findByBookingNumber(`WQ-${searchStr}`)
    }

    if (!booking && /^[0-9a-fA-F]{24}$/.test(searchStr)) {
      booking = await this.bookingRepository.findById(searchStr)
    }

    if (!booking) {
      throw new AppError(`Invalid or unknown QR pass / Booking ID (${searchStr})`, HTTP_STATUS.NOT_FOUND)
    }

    const now = new Date()
    if (booking.qr && booking.qr.qrExpiresAt && new Date(booking.qr.qrExpiresAt) < now) {
      throw new AppError("This QR check-in admit pass has expired", HTTP_STATUS.BAD_REQUEST)
    }

    if (booking.status === BookingStatus.CHECKED_IN || booking.checkedInAt) {
      throw new AppError("This booking QR pass has already been used and checked in", HTTP_STATUS.BAD_REQUEST)
    }

    if (booking.status === BookingStatus.IN_SERVICE || booking.status === BookingStatus.COMPLETED) {
      throw new AppError(`Vehicle is already ${booking.status.replace("_", " ")}`, HTTP_STATUS.BAD_REQUEST)
    }

    if (booking.status === BookingStatus.CANCELLED || Boolean(booking.cancellation?.cancelledAt)) {
      throw new AppError("This booking has been cancelled and cannot be checked in", HTTP_STATUS.BAD_REQUEST)
    }

    if (booking.status === BookingStatus.NO_SHOW) {
      throw new AppError("This booking was marked NO_SHOW as customer missed their time window", HTTP_STATUS.BAD_REQUEST)
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new AppError(
        `Check-in is only allowed for CONFIRMED bookings. Current status is ${booking.status}`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    if (!booking.isWalkIn && booking.scheduling?.windowStart && booking.scheduling?.windowEnd) {
      const windowStart = new Date(booking.scheduling.windowStart)
      const windowEnd = new Date(booking.scheduling.windowEnd)
      const nowMs = now.getTime()

      const formatWindowTime = (d: Date) =>
        d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })

      const startTimeFormatted = formatWindowTime(windowStart)
      const endTimeFormatted = formatWindowTime(windowEnd)

      const earlyBufferMs = 10 * 60 * 1000
      if (nowMs < windowStart.getTime() - earlyBufferMs) {
        throw new AppError(
          `Early Arrival Warning: Customer arrived earlier than their booked time window (${startTimeFormatted} - ${endTimeFormatted}). Check-in is only allowed starting 10 minutes before ${startTimeFormatted}.`,
          HTTP_STATUS.BAD_REQUEST
        )
      }

      const gracePeriodMs = 10 * 60 * 1000
      if (nowMs > windowEnd.getTime() + gracePeriodMs) {
        try {
          const fromStatus = booking.status
          booking.markNoShow()
          await this.bookingRepository.save(booking)
          await this.bookingStatusLogRepository.save(
            new BookingStatusLog({
              id: "",
              bookingId: booking.id,
              fromStatus,
              toStatus: BookingStatus.NO_SHOW,
              changedBy: managerUserId,
              reason: "Auto-marked NO_SHOW: customer's time window expired (+10m grace period) before QR check-in was scanned",
              createdAt: now,
            })
          )
          await this.notificationService.notify("BOOKING_NO_SHOW", booking, {
            reason: "Auto-marked NO_SHOW: time window expired (+10m grace period) before QR check-in",
          })
        } catch (err) {
          logger.warn({ error: err, bookingId: booking.id }, "[ValidateQR] Failed to mark booking as NO_SHOW")
        }

        throw new AppError(
          `Time Window Expired: The booking time window (${startTimeFormatted} - ${endTimeFormatted}) has passed (+10m grace period). Customer missed their window and the booking is marked as NO_SHOW.`,
          HTTP_STATUS.BAD_REQUEST
        )
      }
    }

    const station = await this.stationRepository.findById(booking.stationId)
    if (!station) {
      throw new AppError("Booking station not found", HTTP_STATUS.NOT_FOUND)
    }

    const isOwner = station.ownerId === managerUserId
    let isAuthorizedManager = isOwner

    if (!isAuthorizedManager) {
      const assignment = await this.managerAssignmentRepository.findByUserAndStation(
        managerUserId,
        booking.stationId
      )
      if (assignment && assignment.status === "ACTIVE") {
        isAuthorizedManager = true
      }
    }

    if (!isAuthorizedManager) {
      throw new AppError(
        "You are not authorized to check in bookings for this station",
        HTTP_STATUS.FORBIDDEN
      )
    }

    const isPaymentSatisfied =
      booking.paymentStatus === PaymentStatus.PAID ||
      booking.paymentMethod === PaymentMethod.PAY_AT_STATION

    if (!isPaymentSatisfied) {
      throw new AppError(
        "Required payment conditions are not satisfied for this booking",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    return BookingDTOMapper.toDTO(booking)
  }
}
