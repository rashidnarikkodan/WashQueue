import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { BookingStatus, PaymentStatus, PaymentMethod } from "@/modules/booking/domain/entities/Booking"
import { IBookingRepository } from "@/modules/booking/domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "@/modules/booking/domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "@/modules/booking/domain/entities/BookingStatusLog"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IBookingNotificationService } from "@/modules/notification/notification.module"
import { BookingDTOMapper } from "@/modules/booking/application/mappers/booking-dto.mapper"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { ICompleteHandoverUseCase } from "../interfaces/queue-usecases.interface"
import { BookingResponseDTO } from "@/modules/booking/application/dtos/booking-response.dto"
import { ICreateSettlementUseCase, IProcessSettlementUseCase } from "@/modules/booking/application/interfaces/settlement.usecases"
import logger from "@/configs/logger.config"

export class CompleteHandoverUseCase implements ICompleteHandoverUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly stationRepository: IStationRepository,
    private readonly managerAssignmentRepository: IManagerAssignmentRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService,
    private readonly createSettlementUseCase: ICreateSettlementUseCase,
    private readonly processSettlementUseCase: IProcessSettlementUseCase,
  ) {}

  async execute(managerUserId: string, bookingId: string, notes?: string): Promise<BookingResponseDTO> {
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
        "You are not authorized to complete vehicle handover for this station",
        HTTP_STATUS.FORBIDDEN
      )
    }

    const allowedStatuses = [BookingStatus.SERVICE_COMPLETED, BookingStatus.AWAITING_HANDOVER]
    if (!allowedStatuses.includes(booking.status)) {
      throw new AppError(
        `Vehicle handover requires SERVICE_COMPLETED or AWAITING_HANDOVER status. Current status is ${booking.status}`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    if (!booking.postServiceInspection || !booking.postServiceInspection.capturedAt) {
      throw new AppError(
        "Post-service vehicle quality inspection must be completed prior to customer handover",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const isPaymentSettled =
      booking.paymentStatus === PaymentStatus.PAID ||
      booking.paymentMethod === PaymentMethod.PAY_AT_STATION

    if (!isPaymentSettled) {
      throw new AppError(
        "Required payment settlement has not been satisfied for this booking. Please collect outstanding balance.",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const fromStatus = booking.status

    booking.complete()

    const domainBooking = await this.bookingRepository.updateWithStatusGuard(booking, [
      BookingStatus.SERVICE_COMPLETED,
      BookingStatus.AWAITING_HANDOVER,
    ])

    if (!domainBooking) {
      throw new AppError(
        "Failed to finalize vehicle handover. Handover may have already been completed by another manager.",
        HTTP_STATUS.CONFLICT
      )
    }

    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: domainBooking.id,
      fromStatus,
      toStatus: BookingStatus.COMPLETED,
      changedBy: managerUserId,
      reason: notes || "Vehicle handed over to customer & booking closed",
      createdAt: domainBooking.completedAt || new Date(),
    })
    await this.bookingStatusLogRepository.save(statusLog)

    await this.redisQueueService.updateQueueStatus(domainBooking)

    await this.notificationService.notify("WASH_COMPLETED", domainBooking)

    if (domainBooking.settlement?.stationSettlement) {
      try {
        const settlement = await this.createSettlementUseCase.execute({
          ownerId: domainBooking.ownerId,
          bookingId: domainBooking.id,
          stationId: domainBooking.stationId,
          stationSettlementAmount: domainBooking.settlement.stationSettlement,
          platformCommission: domainBooking.settlement.platformCommission,
          totalAmount: domainBooking.pricingSnapshot.totalPrice,
        })

        if (settlement.id) {
          await this.processSettlementUseCase.execute(settlement.id)
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown settlement error"
        logger.error(
          `Failed to process financial settlement for booking ${domainBooking.id}: ${message}`
        )
      }
    }

    return BookingDTOMapper.toDTO(domainBooking)
  }
}
