import { IStartServiceUseCase } from "../interfaces/queue-usecases.interface"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { BookingStatus } from "@/modules/booking/domain/entities/Booking"
import { IBookingRepository } from "@/modules/booking/domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "@/modules/booking/domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "@/modules/booking/domain/entities/BookingStatusLog"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IBookingNotificationService } from "@/modules/notification/notification.module"
import { BookingDTOMapper } from "@/modules/booking/application/mappers/booking-dto.mapper"
import { BookingResponseDTO } from "@/modules/booking/application/dtos/booking-response.dto"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"

export class StartServiceUseCase implements IStartServiceUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly stationRepository: IStationRepository,
    private readonly managerAssignmentRepository: IManagerAssignmentRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService
  ) {}

  async execute(managerUserId: string, bookingId: string): Promise<BookingResponseDTO> {
    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const booking = await this.bookingRepository.findById(bookingId)
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    const station = await this.stationRepository.findById(booking.stationId)
    if (!station) {
      throw new AppError("Station not found for this booking", HTTP_STATUS.NOT_FOUND)
    }

    const isOwner = station.getProps().ownerId === managerUserId
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
        "You are not authorized to manage service execution for this station",
        HTTP_STATUS.FORBIDDEN
      )
    }

    if (booking.status === BookingStatus.IN_SERVICE) {
      throw new AppError("Service is already active for this booking", HTTP_STATUS.BAD_REQUEST)
    }

    if (booking.status !== BookingStatus.CHECKED_IN) {
      throw new AppError(
        `Cannot start service for booking in ${booking.status} status. Vehicle must be CHECKED_IN.`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    if (!booking.preServiceInspection || !booking.preServiceInspection.capturedAt) {
      throw new AppError(
        "Pre-service vehicle inspection must be completed before starting service",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const totalBays = station.getProps().slotConfig?.bays || 1
    const activeCount = await this.bookingRepository.countByStationAndStatus(
      booking.stationId,
      BookingStatus.IN_SERVICE
    )

    if (activeCount >= totalBays) {
      throw new AppError(
        `All service bays are currently occupied (${activeCount}/${totalBays}). Complete an active service first.`,
        HTTP_STATUS.CONFLICT
      )
    }

    const assignedBayNumber = activeCount + 1

    booking.startService()

    const domainBooking = await this.bookingRepository.updateWithStatusGuard(
      booking,
      BookingStatus.CHECKED_IN
    )

    if (!domainBooking) {
      throw new AppError(
        "Failed to start service. Booking status may have been updated simultaneously by another manager.",
        HTTP_STATUS.CONFLICT
      )
    }

    const now = domainBooking.serviceStartedAt || new Date()

    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: domainBooking.id,
      fromStatus: BookingStatus.CHECKED_IN,
      toStatus: BookingStatus.IN_SERVICE,
      changedBy: managerUserId,
      reason: `Service started in Bay ${assignedBayNumber}`,
      createdAt: now,
    })
    await this.bookingStatusLogRepository.save(statusLog)

    await this.redisQueueService.updateQueueStatus(domainBooking)

    await this.notificationService.notify("WASH_STARTED", domainBooking)

    return BookingDTOMapper.toDTO(domainBooking)
  }
}
