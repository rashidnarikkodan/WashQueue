import {
  IAdvanceBookingStatusUseCase,
  AdvanceBookingStatusInput,
  IStartServiceUseCase,
  ICompleteHandoverUseCase,
} from "../interfaces/queue-usecases.interface"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { BookingStatus } from "@/modules/booking/domain/entities/Booking"
import { IBookingRepository } from "@/modules/booking/domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "@/modules/booking/domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "@/modules/booking/domain/entities/BookingStatusLog"
import { BookingDTOMapper } from "@/modules/booking/application/mappers/booking-dto.mapper"
import { BookingResponseDTO } from "@/modules/booking/application/dtos/booking-response.dto"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { ITimeWindowRepository } from "@/modules/station/domain/repositories/time-window.repository"
import { IBookingNotificationService } from "@/modules/notification/notification.module"
import { isStaffAuthorizedForStation } from "../utils/queue-authorization.util"
import logger from "@/configs/logger.config"

export class AdvanceBookingStatusUseCase implements IAdvanceBookingStatusUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly stationRepository: IStationRepository,
    private readonly managerAssignmentRepository: IManagerAssignmentRepository,
    private readonly startServiceUseCase: IStartServiceUseCase,
    private readonly completeHandoverUseCase: ICompleteHandoverUseCase,
    private readonly timeWindowRepository?: ITimeWindowRepository,
    private readonly notificationService?: IBookingNotificationService
  ) {}

  async execute(
    managerUserId: string,
    input: AdvanceBookingStatusInput
  ): Promise<BookingResponseDTO> {
    const { bookingId, targetStatus, reason } = input

    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    if (!targetStatus) {
      throw new AppError("targetStatus is required", HTTP_STATUS.BAD_REQUEST)
    }

    const typedTargetStatus = targetStatus as BookingStatus

    if (typedTargetStatus === BookingStatus.IN_SERVICE) {
      return await this.startServiceUseCase.execute(managerUserId, bookingId)
    }

    const booking = await this.bookingRepository.findById(bookingId)
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    const station = await this.stationRepository.findById(booking.stationId)
    if (!station) {
      throw new AppError("Station not found for this booking", HTTP_STATUS.NOT_FOUND)
    }

    const isAuthorized = await isStaffAuthorizedForStation(
      station,
      managerUserId,
      this.managerAssignmentRepository
    )

    if (!isAuthorized) {
      throw new AppError(
        "You are not authorized to manage service execution for this station",
        HTTP_STATUS.FORBIDDEN
      )
    }

    if (
      typedTargetStatus === BookingStatus.COMPLETED &&
      (booking.status === BookingStatus.SERVICE_COMPLETED ||
        booking.status === BookingStatus.AWAITING_HANDOVER)
    ) {
      return await this.completeHandoverUseCase.execute(managerUserId, bookingId, reason)
    }

    const fromStatus = booking.status

    if (typedTargetStatus === BookingStatus.NO_SHOW) {
      booking.markNoShow()
      if (this.timeWindowRepository && booking.scheduling?.timeWindowId) {
        try {
          await this.timeWindowRepository.releaseCapacityAtomically(booking.scheduling.timeWindowId)
        } catch (err) {
          logger.error({ err, bookingId }, "Failed to release capacity on NO_SHOW")
        }
      }
    } else if (typedTargetStatus === BookingStatus.CANCELLED) {
      booking.cancel(reason || "Cancelled by staff", managerUserId)
      if (this.timeWindowRepository && booking.scheduling?.timeWindowId) {
        try {
          await this.timeWindowRepository.releaseCapacityAtomically(booking.scheduling.timeWindowId)
        } catch (err) {
          logger.error({ err, bookingId }, "Failed to release capacity on CANCELLED")
        }
      }
    } else {
      if (!booking.canTransitionTo(typedTargetStatus)) {
        throw new AppError(
          `Cannot transition booking status from ${fromStatus} to ${targetStatus}`,
          HTTP_STATUS.BAD_REQUEST
        )
      }
      booking.getProps().status = typedTargetStatus
      booking.getProps().updatedAt = new Date()
    }

    const updated = await this.bookingRepository.update(booking)

    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: updated.id,
      fromStatus,
      toStatus: typedTargetStatus,
      changedBy: managerUserId,
      reason: reason || `Status updated to ${targetStatus}`,
      createdAt: new Date(),
    })
    await this.bookingStatusLogRepository.save(statusLog)

    if (this.notificationService && typedTargetStatus === BookingStatus.NO_SHOW) {
      try {
        await this.notificationService.notify("BOOKING_NO_SHOW", updated, {
          reason: reason || "Customer missed arrival time window",
        })
      } catch (err) {
        logger.error({ err, bookingId }, "Failed to send status update notification")
      }
    }

    const statusLogs = await this.bookingStatusLogRepository.findByBookingId(updated.id)
    return BookingDTOMapper.toDTO(updated, undefined, statusLogs)
  }
}
