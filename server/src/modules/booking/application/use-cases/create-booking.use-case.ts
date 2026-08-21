import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IStationPricingRepository } from "@/modules/station/domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "@/modules/station/domain/repositories/extra-service.repository"
import { ITimeWindowRepository } from "@/modules/station/domain/repositories/time-window.repository"
import { IVehicleRepository } from "@/modules/vehicle/domain/repositories/vehicle.repository"
import { StationStatus } from "@/modules/station/domain/entities/Station"
import { Booking, BookingStatus, derivePaymentStatus } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { BookingNumberService } from "../../domain/services/BookingNumberService"
import { QRTokenService } from "../../domain/services/QRTokenService"
import { BookingPricingService } from "../../domain/services/BookingPricingService"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { CreateBookingInput } from "../dtos/create-booking.dto"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { ICreateBookingUseCase } from "../interfaces/booking-usecases.interface"
import { BookingPricingResolutionService } from "../services/booking-pricing-resolution.service"

export class CreateBookingUseCase implements ICreateBookingUseCase {
  private readonly pricingResolutionService: BookingPricingResolutionService

  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly stationRepository: IStationRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository,
    private readonly timeWindowRepository: ITimeWindowRepository,
    private readonly vehicleRepository: IVehicleRepository,
    private readonly notificationService: IBookingNotificationService
  ) {
    this.pricingResolutionService = new BookingPricingResolutionService(
      stationPricingRepository,
      extraServiceRepository
    )
  }

  async execute(userId: string, input: CreateBookingInput): Promise<BookingResponseDTO> {
    const station = await this.stationRepository.findById(input.stationId)
    if (!station) {
      throw new AppError("Station not found", HTTP_STATUS.NOT_FOUND)
    }

    if (station.status !== StationStatus.ACTIVE || !station.getProps().isActive) {
      throw new AppError("Station is currently inactive or suspended", HTTP_STATUS.BAD_REQUEST)
    }

    const vehicle = await this.vehicleRepository.findById(input.vehicleId)
    if (!vehicle || vehicle.userId !== userId || !vehicle.data.isActive) {
      throw new AppError("Vehicle not found or does not belong to user", HTTP_STATUS.BAD_REQUEST)
    }

    const { basePrice, selectedExtraServices } = await this.pricingResolutionService.resolve(
      station.id,
      vehicle.data.classId,
      input.serviceType,
      input.extraServiceIds
    )

    const timeWindow = await this.timeWindowRepository.findById(input.timeWindowId)
    if (!timeWindow || timeWindow.stationId !== station.id) {
      throw new AppError("Selected time window not found", HTTP_STATUS.NOT_FOUND)
    }

    timeWindow.updateStatusBasedOnTimeAndCapacity()
    if (!timeWindow.isBookable) {
      throw new AppError(
        "Selected time window is no longer available or is full",
        HTTP_STATUS.CONFLICT
      )
    }

    const reservedWindow = await this.timeWindowRepository.reserveCapacityAtomically(timeWindow.id)
    if (!reservedWindow) {
      throw new AppError(
        "Failed to reserve capacity for time window. It may have filled up.",
        HTTP_STATUS.CONFLICT
      )
    }

    const pricingResult = BookingPricingService.calculate({
      basePrice,
      extraServices: selectedExtraServices,
      paymentMethod: input.paymentMethod,
      isWalkIn: false,
    })

    const bookingNumber = BookingNumberService.generate()
    const qrResult = QRTokenService.generateToken(timeWindow.windowEnd)

    const now = new Date()
    const booking = new Booking({
      id: "",
      bookingNumber,
      userId,
      providerId: station.ownerId && station.ownerId.length > 0 ? station.ownerId : userId,
      stationId: station.id,
      vehicleId: vehicle.id,
      vehicleSnapshot: {
        vehicleCategoryId: vehicle.data.categoryId,
        vehicleClassId: vehicle.data.classId,
      },
      serviceType: input.serviceType,
      pricingSnapshot: pricingResult.pricingSnapshot,
      extraServices: selectedExtraServices,
      scheduling: {
        timeWindowId: timeWindow.id,
        windowStart: timeWindow.windowStart,
        windowEnd: timeWindow.windowEnd,
      },
      isWalkIn: false,
      createdByUserId: userId,
      qr: {
        qrTokenHash: qrResult.qrTokenHash,
        qrExpiresAt: qrResult.qrExpiresAt,
      },
      paymentStatus: derivePaymentStatus(input.paymentMethod, false),
      paymentMethod: input.paymentMethod,
      depositAmount: pricingResult.depositAmount,
      cashAmount: pricingResult.cashAmount,
      refundAmount: 0,
      settlement: pricingResult.settlement,
      status: BookingStatus.CONFIRMED,
      createdAt: now,
      updatedAt: now,
    })

    const savedBooking = await this.bookingRepository.save(booking)

    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: savedBooking.id,
      fromStatus: null,
      toStatus: BookingStatus.CONFIRMED,
      changedBy: userId,
      reason: "Customer created booking",
      createdAt: now,
    })
    await this.bookingStatusLogRepository.save(statusLog)

    await this.notificationService.notify("BOOKING_CREATED", savedBooking)

    return BookingDTOMapper.toDTO(savedBooking, qrResult.rawToken)
  }
}
