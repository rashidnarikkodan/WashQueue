import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IStationPricingRepository } from "@/modules/station/domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "@/modules/station/domain/repositories/extra-service.repository"
import { ITimeWindowRepository } from "@/modules/station/domain/repositories/time-window.repository"
import { StationStatus } from "@/modules/station/domain/entities/Station"
import { Booking, BookingStatus, PaymentStatus, PaymentType } from "../../domain/entities/Booking"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { BookingNumberService } from "../../domain/services/BookingNumberService"
import { QRTokenService } from "../../domain/services/QRTokenService"
import { BookingPricingService } from "../../domain/services/BookingPricingService"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { CreateWalkInBookingInput } from "../dtos/create-walkin-booking.dto"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { ICreateWalkInBookingUseCase } from "../interfaces/booking-usecases.interface"
import { BookingPricingResolutionService } from "../services/booking-pricing-resolution.service"

export class CreateWalkInBookingUseCase implements ICreateWalkInBookingUseCase {
  private readonly pricingResolutionService: BookingPricingResolutionService

  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly stationRepository: IStationRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository,
    private readonly timeWindowRepository: ITimeWindowRepository,
    private readonly redisQueueService: IBookingQueueService,
    private readonly notificationService: IBookingNotificationService
  ) {
    this.pricingResolutionService = new BookingPricingResolutionService(
      stationPricingRepository,
      extraServiceRepository
    )
  }

  async execute(
    managerUserId: string,
    input: CreateWalkInBookingInput
  ): Promise<BookingResponseDTO> {
    // 1. Validate Station
    const station = await this.stationRepository.findById(input.stationId)
    if (!station) {
      throw new AppError("Station not found", HTTP_STATUS.NOT_FOUND)
    }

    if (station.status !== StationStatus.ACTIVE || !station.getProps().isActive) {
      throw new AppError("Station is currently inactive or suspended", HTTP_STATUS.BAD_REQUEST)
    }

    // 2 & 3. Resolve pricing for vehicle class and validate/price extra services
    const { basePrice, selectedExtraServices } = await this.pricingResolutionService.resolve(
      station.id,
      input.vehicle.classId,
      input.serviceType,
      input.extraServiceIds
    )

    // 4. Validate Time Window & Reserve Walk-In Capacity Atomically
    let timeWindow = input.timeWindowId ? await this.timeWindowRepository.findById(input.timeWindowId) : null
    if (!timeWindow) {
      const todayStr = new Date().toISOString().split("T")[0] || ""
      const todayWindows = await this.timeWindowRepository.findByStationIdAndDate(station.id, todayStr)
      if (todayWindows && todayWindows.length > 0) {
        const nowMs = Date.now()
        const activeWin = todayWindows.find(
          (w) => new Date(w.windowStart).getTime() <= nowMs && new Date(w.windowEnd).getTime() > nowMs
        )
        timeWindow = activeWin || todayWindows[0] || null
      }
    }

    if (!timeWindow || timeWindow.stationId !== station.id) {
      throw new AppError("Selected time window not found", HTTP_STATUS.NOT_FOUND)
    }

    const reservedWindow = await this.timeWindowRepository.reserveWalkInCapacityAtomically(timeWindow.id)
    if (!reservedWindow) {
      throw new AppError(
        "Walk-in slot capacity is fully occupied for this time window. Please select another time window.",
        HTTP_STATUS.CONFLICT
      )
    }

    // 5. Calculate Pricing
    const paymentType = input.paymentType || PaymentType.CASH_WALKIN
    const pricingResult = BookingPricingService.calculate({
      basePrice,
      extraServices: selectedExtraServices,
      paymentType,
    })

    // 6. Generate Booking Number and QR Token
    const bookingNumber = BookingNumberService.generate()
    const qrResult = QRTokenService.generateToken(timeWindow.windowEnd)

    // 7. Create Walk-in Booking Aggregate (Initial status is CONFIRMED, ready for pre-service inspection)
    const now = new Date()
    const booking = new Booking({
      id: "",
      bookingNumber,
      userId: input.customer?.userId || null,
      providerId: station.ownerId,
      stationId: station.id,
      vehicleId: input.vehicle.vehicleId || null,
      vehicleSnapshot: {
        vehicleCategoryId: input.vehicle.categoryId,
        vehicleClassId: input.vehicle.classId,
      },
      serviceType: input.serviceType,
      pricingSnapshot: pricingResult.pricingSnapshot,
      extraServices: selectedExtraServices,
      scheduling: {
        timeWindowId: timeWindow.id,
        windowStart: timeWindow.windowStart,
        windowEnd: timeWindow.windowEnd,
      },
      isWalkIn: true,
      walkInCustomer: input.customer
        ? {
            userId: input.customer.userId,
            name: input.customer.name,
            phone: input.customer.phone,
          }
        : null,
      walkInVehicle: {
        vehicleId: input.vehicle.vehicleId,
        registrationNumber: input.vehicle.registrationNumber,
        categoryId: input.vehicle.categoryId,
        classId: input.vehicle.classId,
      },
      createdByUserId: managerUserId,
      qr: {
        qrTokenHash: qrResult.qrTokenHash,
        qrExpiresAt: qrResult.qrExpiresAt,
      },
      paymentStatus:
        paymentType === PaymentType.CASH_WALKIN ? PaymentStatus.PAID : PaymentStatus.PENDING,
      paymentType,
      depositAmount: pricingResult.depositAmount,
      cashAmount: pricingResult.cashAmount,
      refundAmount: 0,
      settlement: pricingResult.settlement,
      status: BookingStatus.CONFIRMED,
      createdAt: now,
      updatedAt: now,
    })

    // 8. Save Booking & Audit Log
    const savedBooking = await this.bookingRepository.save(booking)

    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: savedBooking.id,
      fromStatus: null,
      toStatus: BookingStatus.CONFIRMED,
      changedBy: managerUserId,
      reason: "Manager created walk-in booking (Pending Pre-Service Inspection)",
      createdAt: now,
    })
    await this.bookingStatusLogRepository.save(statusLog)

    // 10. Dispatch Notification
    await this.notificationService.notify("BOOKING_CREATED", savedBooking)

    return BookingDTOMapper.toDTO(savedBooking, qrResult.rawToken)
  }
}
