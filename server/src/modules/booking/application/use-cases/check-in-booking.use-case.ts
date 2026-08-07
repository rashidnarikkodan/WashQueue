import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { BookingStatus } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { QRTokenService } from "../../domain/services/QRTokenService"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { BookingRedisQueueService } from "../../infrastructure/services/booking-redis-queue.service"
import { BookingNotificationService } from "../../infrastructure/services/booking-notification.service"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { CheckInBookingInput } from "../dtos/checkin-booking.dto"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { ICheckInBookingUseCase } from "../interfaces/booking-usecases.interface"

export class CheckInBookingUseCase implements ICheckInBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: BookingRedisQueueService,
    private readonly notificationService: BookingNotificationService
  ) {}

  async execute(managerUserId: string, input: CheckInBookingInput): Promise<BookingResponseDTO> {
    let booking = null

    // 1. If QR token provided, hash it and find booking
    if (input.qrToken) {
      const qrHash = QRTokenService.hashToken(input.qrToken)
      booking = await this.bookingRepository.findByQrTokenHash(qrHash)
    }

    // 2. Fallback to bookingId if provided and not found by QR hash
    if (!booking && input.bookingId) {
      booking = await this.bookingRepository.findById(input.bookingId)
    }

    if (!booking) {
      throw new AppError("Invalid or unknown QR token / Booking ID", HTTP_STATUS.NOT_FOUND)
    }

    // 3. Validate status
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new AppError(
        `Booking cannot be checked in from status ${booking.status}`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    // 4. Validate QR expiry
    if (booking.qr.qrExpiresAt < new Date()) {
      throw new AppError("QR token has expired", HTTP_STATUS.BAD_REQUEST)
    }

    // 5. Update domain status to CHECKED_IN
    const fromStatus = booking.status
    booking.checkIn(managerUserId)
    const updatedBooking = await this.bookingRepository.update(booking)

    // 6. Write status log
    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: updatedBooking.id,
      fromStatus,
      toStatus: BookingStatus.CHECKED_IN,
      changedBy: managerUserId,
      reason: "Manager checked in customer via QR scan",
      createdAt: new Date(),
    })
    await this.bookingStatusLogRepository.save(statusLog)

    // 7. Push to Redis station queue
    await this.redisQueueService.pushToStationQueue(updatedBooking)

    // 8. Send notification
    await this.notificationService.notify("CHECKIN_SUCCESS", updatedBooking)

    return BookingDTOMapper.toDTO(updatedBooking)
  }
}
