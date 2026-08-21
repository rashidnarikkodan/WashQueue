import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { BookingStatus } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { ITimeWindowRepository } from "@/modules/station/domain/repositories/time-window.repository"
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { RescheduleBookingInput } from "../dtos/reschedule-booking.dto"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { IRescheduleBookingUseCase } from "../interfaces/booking-usecases.interface"
import { ITransactionRunner } from "@/core/domain/transaction.interface"

export class RescheduleBookingUseCase implements IRescheduleBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly timeWindowRepository: ITimeWindowRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly notificationService: IBookingNotificationService,
    private readonly transactionRunner?: ITransactionRunner
  ) {}

  async execute(
    userId: string,
    input: RescheduleBookingInput,
    userRole?: string
  ): Promise<BookingResponseDTO> {
    const booking = await this.bookingRepository.findById(input.bookingId)
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    // 1. Authorization check
    const isStaff = userRole === "MANAGER" || userRole === "OWNER" || userRole === "ADMIN"
    if (!isStaff && booking.userId !== userId) {
      throw new AppError("You are not authorized to reschedule this booking", HTTP_STATUS.FORBIDDEN)
    }

    // 2. Walk-in restriction
    if (booking.isWalkIn) {
      throw new AppError("Walk-in bookings cannot be rescheduled", HTTP_STATUS.BAD_REQUEST)
    }

    // 3. Status restriction
    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new AppError(
        `Cannot reschedule booking in status ${booking.status}`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    // 4. Max Reschedule Limit Check (Max 2 times)
    if (booking.rescheduleCount >= 2) {
      throw new AppError(
        "Maximum limit of 2 reschedules has been reached for this booking. Further rescheduling is not permitted.",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const now = new Date()

    // 5. 24-Hour Policy Rule Check
    if (!booking.canReschedule(now)) {
      throw new AppError(
        "Bookings can only be rescheduled at least 24 hours prior to the scheduled window start",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    // 5. Validate Target Time Window
    const newTimeWindow = await this.timeWindowRepository.findById(input.newTimeWindowId)
    if (!newTimeWindow) {
      throw new AppError("Selected time window not found", HTTP_STATUS.NOT_FOUND)
    }

    if (newTimeWindow.stationId !== booking.stationId) {
      throw new AppError(
        "Booking can only be rescheduled to a time window at the same station",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    if (newTimeWindow.id === booking.scheduling.timeWindowId) {
      throw new AppError(
        "Booking is already scheduled for this time window",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    newTimeWindow.updateStatusBasedOnTimeAndCapacity()
    if (!newTimeWindow.isBookable) {
      throw new AppError(
        "Selected time window is no longer available or is full",
        HTTP_STATUS.CONFLICT
      )
    }

    // 6. Atomically reserve capacity on the new window
    const reservedNewWindow = await this.timeWindowRepository.reserveCapacityAtomically(
      newTimeWindow.id
    )
    if (!reservedNewWindow) {
      throw new AppError(
        "Failed to reserve capacity for the new time window. It may have filled up.",
        HTTP_STATUS.CONFLICT
      )
    }

    // 7. Atomically release capacity on the old window
    const oldTimeWindowId = booking.scheduling.timeWindowId
    if (oldTimeWindowId) {
      await this.timeWindowRepository.releaseCapacityAtomically(oldTimeWindowId)
    }

    // 8. Domain state mutation
    const oldScheduling = { ...booking.scheduling }
    booking.reschedule(
      {
        timeWindowId: newTimeWindow.id,
        windowStart: newTimeWindow.windowStart,
        windowEnd: newTimeWindow.windowEnd,
      },
      now
    )

    // 9. Persist booking and audit status log
    const runRescheduleWork = async (session?: unknown) => {
      const updated = await this.bookingRepository.updateWithStatusGuard(
        booking,
        [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        session
      )
      if (!updated) return null

      const statusLog = new BookingStatusLog({
        id: "",
        bookingId: updated.id,
        fromStatus: booking.status,
        toStatus: booking.status,
        changedBy: userId,
        reason: isStaff ? "Rescheduled by station staff" : "Rescheduled by customer",
        notes: `Rescheduled from ${oldScheduling.windowStart.toISOString()} to ${newTimeWindow.windowStart.toISOString()}`,
        createdAt: now,
      })
      await this.bookingStatusLogRepository.save(statusLog, session)

      return updated
    }

    const domainBooking = this.transactionRunner
      ? await this.transactionRunner.runInTransaction(runRescheduleWork)
      : await runRescheduleWork()

    if (!domainBooking) {
      // Rollback time window capacities if concurrency guard fails
      await this.timeWindowRepository.releaseCapacityAtomically(newTimeWindow.id)
      if (oldTimeWindowId) {
        await this.timeWindowRepository.reserveCapacityAtomically(oldTimeWindowId)
      }

      throw new AppError(
        "Rescheduling failed. Booking status may have changed concurrently.",
        HTTP_STATUS.CONFLICT
      )
    }

    // 10. Real-time notifications to customer and station managers
    await this.notificationService.notify("BOOKING_RESCHEDULED", domainBooking, {
      oldScheduling,
      newScheduling: domainBooking.scheduling,
    })

    return BookingDTOMapper.toDTO(domainBooking)
  }
}
