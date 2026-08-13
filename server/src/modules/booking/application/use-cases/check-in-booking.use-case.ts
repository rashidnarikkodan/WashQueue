import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { BookingStatus } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { QRTokenService } from "../../domain/services/QRTokenService"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { CheckInBookingInput } from "../dtos/checkin-booking.dto"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { ICheckInBookingUseCase } from "../interfaces/booking-usecases.interface"

export class CheckInBookingUseCase implements ICheckInBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService
  ) {}

  async execute(managerUserId: string, input: CheckInBookingInput): Promise<BookingResponseDTO> {
    const rawInput = (input.qrToken || input.bookingId || "").trim()

    if (!rawInput) {
      throw new AppError("QR token or Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    let booking = null

    // 1. First attempt: Find by QR token hash
    try {
      const qrHash = QRTokenService.hashToken(rawInput)
      booking = await this.bookingRepository.findByQrTokenHash(qrHash)
    } catch (e) {
      // Ignore QR hashing errors and fallback to booking number
    }

    // 2. Second attempt: Find by bookingNumber (e.g. WQ-829301)
    if (!booking) {
      booking = await this.bookingRepository.findByBookingNumber(rawInput)
    }

    // 3. Third attempt: If input doesn't start with WQ-, try prefixing WQ-
    if (!booking && !rawInput.toUpperCase().startsWith("WQ-")) {
      booking = await this.bookingRepository.findByBookingNumber(`WQ-${rawInput}`)
    }

    // 4. Fourth attempt: Find by Mongo _id
    if (!booking && /^[0-9a-fA-F]{24}$/.test(rawInput)) {
      booking = await this.bookingRepository.findById(rawInput)
    }

    if (!booking) {
      throw new AppError(
        `Invalid or unknown QR token / Booking ID (${rawInput})`,
        HTTP_STATUS.NOT_FOUND
      )
    }

    // Check if already checked in
    if (booking.status === BookingStatus.CHECKED_IN) {
      throw new AppError("Customer vehicle is already checked in", HTTP_STATUS.BAD_REQUEST)
    }

    // Validate status
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new AppError(
        `Booking cannot be checked in from status ${booking.status}`,
        HTTP_STATUS.BAD_REQUEST
      )
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
