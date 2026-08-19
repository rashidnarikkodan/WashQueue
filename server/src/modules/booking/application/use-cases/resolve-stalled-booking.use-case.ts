import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { BookingStatus } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { IEvaluateAndProcessRefundUseCase } from "../interfaces/booking-usecases.interface"

export interface ResolveStalledBookingInput {
  bookingId: string
  resolution: string
  targetStatus?: "CHECKED_IN" | "IN_SERVICE" | "CANCELLED"
}

export class ResolveStalledBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService,
    private readonly evaluateAndProcessRefundUseCase?: IEvaluateAndProcessRefundUseCase
  ) {}

  /**
   * Explicit Recovery Business Operation:
   * Recovers a STALLED booking to CHECKED_IN, IN_SERVICE, or CANCELLED.
   */
  async execute(managerUserId: string, input: ResolveStalledBookingInput): Promise<BookingResponseDTO> {
    const { bookingId, resolution, targetStatus } = input

    if (!bookingId || !resolution?.trim()) {
      throw new AppError("Booking ID and resolution details are required", HTTP_STATUS.BAD_REQUEST)
    }

    const booking = await this.bookingRepository.findById(bookingId)
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    if (booking.status !== BookingStatus.STALLED) {
      throw new AppError(`Only STALLED bookings can be resolved. Current status is ${booking.status}`, HTTP_STATUS.BAD_REQUEST)
    }

    const previousStatus = booking.stalledInfo?.previousStatus || BookingStatus.CHECKED_IN
    const finalTargetStatus: BookingStatus = targetStatus
      ? (targetStatus as BookingStatus)
      : (previousStatus as BookingStatus)

    const allowedTargets = [BookingStatus.CHECKED_IN, BookingStatus.IN_SERVICE, BookingStatus.CANCELLED]
    if (!allowedTargets.includes(finalTargetStatus)) {
      throw new AppError(
        `Invalid recovery target status. Allowed target recovery statuses are CHECKED_IN, IN_SERVICE, or CANCELLED`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    booking.resolveStall(resolution.trim(), managerUserId, finalTargetStatus)

    // Optimistic-concurrency guard (STALLED -> target status)
    const domainBooking = await this.bookingRepository.updateWithStatusGuard(booking, BookingStatus.STALLED)

    if (!domainBooking) {
      throw new AppError("Failed to resolve stalled booking", HTTP_STATUS.CONFLICT)
    }

    const now = domainBooking.stalledInfo?.resolvedAt || new Date()

    // If resolved via cancellation, evaluate domain refund policy
    if (finalTargetStatus === BookingStatus.CANCELLED && this.evaluateAndProcessRefundUseCase) {
      await this.evaluateAndProcessRefundUseCase.execute({
        bookingId: domainBooking.id,
        responsibility: "STATION",
        reason: `Cancelled from stalled state: ${resolution}`,
      })
    }

    // Save Audit Log
    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: domainBooking.id,
      fromStatus: BookingStatus.STALLED,
      toStatus: finalTargetStatus,
      changedBy: managerUserId,
      reason: `Stalled booking resolved to ${finalTargetStatus}: ${resolution}`,
      createdAt: now,
    })
    await this.bookingStatusLogRepository.save(statusLog)

    // Sync Redis Operational Queue State
    await this.redisQueueService.updateQueueStatus(domainBooking)

    // Dispatch Real-Time Socket Event
    await this.notificationService.notify("QUEUE_UPDATED", domainBooking, {
      resolvedStatus: finalTargetStatus,
      resolution,
    })

    return BookingDTOMapper.toDTO(domainBooking)
  }
}
