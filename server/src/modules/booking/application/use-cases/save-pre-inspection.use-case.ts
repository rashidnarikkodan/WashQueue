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
import { BookingModel } from "../../infrastructure/models/booking.model"
import { BookingMapper } from "../../infrastructure/mappers/booking.mapper"

export interface SavePreInspectionInput {
  bookingId: string
  photos?: string[]
  notes?: string
}

export class SavePreInspectionAndCheckInUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService
  ) {}

  async execute(
    managerUserId: string,
    input: SavePreInspectionInput
  ): Promise<BookingResponseDTO> {
    const { bookingId, photos = [], notes = "" } = input

    if (!bookingId) {
      throw new AppError("Booking ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const existing = await this.bookingRepository.findById(bookingId)
    if (!existing) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    if (existing.status !== BookingStatus.CONFIRMED) {
      throw new AppError(
        `Pre-service inspection and check-in requires CONFIRMED status. Current status is ${existing.status}`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const now = new Date()
    const inspectionRecord = {
      photos,
      notes: notes.trim() || "Pre-service inspection completed",
      capturedBy: managerUserId,
      capturedAt: now,
    }

    // Atomic findOneAndUpdate with status: CONFIRMED to prevent race conditions & duplicate check-ins
    const updatedDoc = await BookingModel.findOneAndUpdate(
      { _id: bookingId, status: BookingStatus.CONFIRMED },
      {
        $set: {
          status: BookingStatus.CHECKED_IN,
          checkedInAt: now,
          checkedInBy: managerUserId,
          preServiceInspection: inspectionRecord,
          updatedAt: now,
        },
      },
      { new: true }
    )
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")

    if (!updatedDoc) {
      throw new AppError(
        "Check-in failed. Booking may have already been checked in or status changed.",
        HTTP_STATUS.CONFLICT
      )
    }

    const domainBooking = BookingMapper.toDomain(updatedDoc)

    // Save audit log
    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: domainBooking.id,
      fromStatus: BookingStatus.CONFIRMED,
      toStatus: BookingStatus.CHECKED_IN,
      changedBy: managerUserId,
      reason: notes ? `Pre-service inspection logged: ${notes}` : "Pre-service inspection completed",
      createdAt: now,
    })
    await this.bookingStatusLogRepository.save(statusLog)

    // Push to Redis station queue
    await this.redisQueueService.pushToStationQueue(domainBooking)

    // Send notification
    await this.notificationService.notify("CHECKIN_SUCCESS", domainBooking)

    return BookingDTOMapper.toDTO(domainBooking)
  }
}
