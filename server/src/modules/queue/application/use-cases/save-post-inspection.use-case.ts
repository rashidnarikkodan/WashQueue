import { ISavePostInspectionUseCase } from "../interfaces/queue-usecases.interface"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import {
  BookingStatus,
  InspectionChecklistItem,
  InspectionPhoto,
} from "@/modules/booking/domain/entities/Booking"
import { IBookingRepository } from "@/modules/booking/domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "@/modules/booking/domain/repositories/booking-status-log.repository"
import { BookingStatusLog } from "@/modules/booking/domain/entities/BookingStatusLog"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IBookingNotificationService } from "@/modules/notification/notification.module"
import { BookingDTOMapper } from "@/modules/booking/application/mappers/booking-dto.mapper"
import { BookingResponseDTO } from "@/modules/booking/application/dtos/booking-response.dto"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"

import {
  ICreateSettlementUseCase,
  IProcessSettlementUseCase,
} from "@/modules/booking/application/interfaces/settlement.usecases"
import logger from "@/configs/logger.config"

export interface SavePostInspectionInput {
  bookingId: string
  photos?: InspectionPhoto[]
  notes?: string
  checklist?: InspectionChecklistItem[]
}

const REQUIRED_INSPECTION_PHOTO_COUNT = 4

const REQUIRED_CHECKLIST_KEYS = [
  "paintGloss",
  "wheels",
  "glass",
  "dashboard",
  "seats",
  "specialRequest",
]

export class SavePostInspectionUseCase implements ISavePostInspectionUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly stationRepository: IStationRepository,
    private readonly managerAssignmentRepository: IManagerAssignmentRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService,
    private readonly createSettlementUseCase: ICreateSettlementUseCase,
    private readonly processSettlementUseCase: IProcessSettlementUseCase
  ) {}

  async execute(
    managerUserId: string,
    input: SavePostInspectionInput
  ): Promise<BookingResponseDTO> {
    const { bookingId, photos = [], notes = "", checklist = [] } = input

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
        "You are not authorized to complete post-inspection for this station",
        HTTP_STATUS.FORBIDDEN
      )
    }

    const allowedStatuses = [
      BookingStatus.IN_SERVICE,
      BookingStatus.SERVICE_COMPLETED,
      BookingStatus.AWAITING_HANDOVER,
    ]
    if (!allowedStatuses.includes(booking.status)) {
      throw new AppError(
        `Post-service inspection and handover requires an active service status. Current status is ${booking.status}`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    if (photos.filter((p) => p?.secured_url).length < REQUIRED_INSPECTION_PHOTO_COUNT) {
      throw new AppError(
        `Post-service inspection requires all ${REQUIRED_INSPECTION_PHOTO_COUNT} vehicle angle photos (front, rear, left, right) before handover`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const checklistKeys = new Set(checklist.map((c) => c.key))
    const missingChecklistKeys = REQUIRED_CHECKLIST_KEYS.filter((key) => !checklistKeys.has(key))
    if (missingChecklistKeys.length > 0) {
      throw new AppError(
        `Post-service inspection requires every checklist item to be reviewed (missing: ${missingChecklistKeys.join(", ")})`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const failedItemsMissingRemark = checklist.filter((c) => !c.passed && !c.remark?.trim())
    if (failedItemsMissingRemark.length > 0) {
      throw new AppError(
        `A remark is required for each failed checklist item (missing: ${failedItemsMissingRemark
          .map((c) => c.label)
          .join(", ")})`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const fromStatus = booking.status
    const now = new Date()
    const inspectionRecord = {
      photos,
      notes: notes.trim() || "Post-service quality inspection verified",
      capturedBy: managerUserId,
      capturedAt: now,
      checklist,
    }

    booking.completePostInspection(inspectionRecord)

    const domainBooking = await this.bookingRepository.updateWithStatusGuard(
      booking,
      allowedStatuses
    )

    if (!domainBooking) {
      throw new AppError(
        "Failed to save post-service inspection. Handover may have already been completed.",
        HTTP_STATUS.CONFLICT
      )
    }

    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: domainBooking.id,
      fromStatus,
      toStatus: BookingStatus.COMPLETED,
      changedBy: managerUserId,
      reason: notes
        ? `Post-inspection & vehicle handover completed: ${notes}`
        : "Post-service inspection verified & vehicle handed over to customer",
      createdAt: now,
    })
    await this.bookingStatusLogRepository.save(statusLog)

    await this.redisQueueService.updateQueueStatus(domainBooking)

    await this.notificationService.notify("WASH_COMPLETED", domainBooking)

    const bookingDTO = BookingDTOMapper.toDTO(domainBooking)

    const settlementSnapshot = domainBooking.settlement || {
      platformCommission: 0,
      stationSettlement: domainBooking.pricingSnapshot?.totalPrice ?? 0,
    }

    if (settlementSnapshot.stationSettlement >= 0) {
      try {
        const ownerId =
          domainBooking.ownerId ||
          station.getProps().ownerId ||
          station.ownerId ||
          domainBooking.createdByUserId

        let settlement = await this.createSettlementUseCase.execute({
          ownerId,
          bookingId: domainBooking.id,
          stationId: domainBooking.stationId,
          stationSettlementAmount: settlementSnapshot.stationSettlement,
          platformCommission: settlementSnapshot.platformCommission,
          totalAmount: domainBooking.pricingSnapshot?.totalPrice ?? 0,
        })

        if (settlement.id) {
          settlement = await this.processSettlementUseCase.execute(settlement.id)
        }

        bookingDTO.settlementOutcome = {
          status: settlement.status,
          amount: settlement.stationSettlementAmount,
          transferId: settlement.transferId,
          holdReason: settlement.holdReason,
          failureReason: settlement.failureReason,
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown settlement error"
        logger.error(
          { err, bookingId: domainBooking.id },
          `Failed to process financial settlement for booking ${domainBooking.id}: ${message}`
        )
        bookingDTO.settlementOutcome = {
          status: "FAILED",
          failureReason: message,
        }
      }
    }

    return bookingDTO
  }
}
