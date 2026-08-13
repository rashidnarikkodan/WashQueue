import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { BookingStatus } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { AdvanceStatusInput } from "../dtos/advance-status.dto"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { IAdvanceBookingStatusUseCase } from "../interfaces/booking-usecases.interface"

export class AdvanceBookingStatusUseCase implements IAdvanceBookingStatusUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService
  ) {}

  async execute(managerUserId: string, input: AdvanceStatusInput): Promise<BookingResponseDTO> {
    const booking = await this.bookingRepository.findById(input.bookingId)
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    if (!booking.canTransitionTo(input.targetStatus)) {
      throw new AppError(
        `Cannot transition booking status from ${booking.status} to ${input.targetStatus}`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const fromStatus = booking.status

    switch (input.targetStatus) {
      case BookingStatus.IN_SERVICE:
        booking.startService()
        await this.notificationService.notify("WASH_STARTED", booking)
        break
      case BookingStatus.SERVICE_COMPLETED:
        booking.completeService()
        await this.notificationService.notify("WASH_COMPLETED", booking)
        break
      case BookingStatus.AWAITING_HANDOVER:
        booking.initiateHandover()
        break
      case BookingStatus.COMPLETED:
        booking.complete()
        break
      case BookingStatus.NO_SHOW:
        booking.markNoShow()
        break
      case BookingStatus.CANCELLED:
        booking.cancel(input.notes || "Cancelled by manager", managerUserId)
        break
      default:
        throw new AppError(
          `Unsupported status transition to ${input.targetStatus}`,
          HTTP_STATUS.BAD_REQUEST
        )
    }

    const updatedBooking = await this.bookingRepository.update(booking)

    // Save status log
    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: updatedBooking.id,
      fromStatus,
      toStatus: input.targetStatus,
      changedBy: managerUserId,
      reason: input.notes || `Status advanced to ${input.targetStatus}`,
      createdAt: new Date(),
    })
    await this.bookingStatusLogRepository.save(statusLog)

    // Update Redis state
    await this.redisQueueService.updateQueueStatus(updatedBooking)

    return BookingDTOMapper.toDTO(updatedBooking)
  }
}
