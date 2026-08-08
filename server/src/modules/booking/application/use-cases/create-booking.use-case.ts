import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IStationPricingRepository } from "@/modules/station/domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "@/modules/station/domain/repositories/extra-service.repository"
import { ITimeWindowRepository } from "@/modules/station/domain/repositories/time-window.repository"
import { IVehicleRepository } from "@/modules/vehicle/domain/repositories/vehicle.repository"
import { StationStatus } from "@/modules/station/domain/entities/Station"
import { Booking, BookingStatus, PaymentStatus } from "../../domain/entities/Booking"
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

export class CreateBookingUseCase implements ICreateBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly stationRepository: IStationRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository,
    private readonly timeWindowRepository: ITimeWindowRepository,
    private readonly vehicleRepository: IVehicleRepository,
    private readonly notificationService: IBookingNotificationService
  ) {}

  async execute(userId: string, input: CreateBookingInput): Promise<BookingResponseDTO> {
    // 1. Validate Station
    const station = await this.stationRepository.findById(input.stationId)
    if (!station) {
      throw new AppError("Station not found", HTTP_STATUS.NOT_FOUND)
    }

    if (station.status !== StationStatus.ACTIVE || !station.getProps().isActive) {
      throw new AppError("Station is currently inactive or suspended", HTTP_STATUS.BAD_REQUEST)
    }

    // 2. Validate Vehicle belongs to user
    const vehicle = await this.vehicleRepository.findById(input.vehicleId)
    if (!vehicle || vehicle.userId !== userId || !vehicle.data.isActive) {
      throw new AppError("Vehicle not found or does not belong to user", HTTP_STATUS.BAD_REQUEST)
    }

    // 3. Validate Station pricing for vehicle class
    const pricings = await this.stationPricingRepository.findByStationId(station.id)
    const pricing = pricings.find((p) => p.vehicleClassId === vehicle.data.classId && p.isActive)
    if (!pricing) {
      throw new AppError(
        "Station does not support or have active pricing for this vehicle class",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const basePrice = input.serviceType === "FULL" ? pricing.fullWashPrice : pricing.halfWashPrice

    // 4. Validate Extra Services
    const availableExtras = await this.extraServiceRepository.findByStationId(station.id)
    const selectedExtraServices: Array<{ serviceId: string; name: string; price: number }> = []

    if (input.extraServiceIds && input.extraServiceIds.length > 0) {
      for (const extraId of input.extraServiceIds) {
        const extra = availableExtras.find((e) => e.id === extraId && e.isActive)
        if (!extra) {
          throw new AppError(
            `Extra service ${extraId} is invalid or inactive for this station`,
            HTTP_STATUS.BAD_REQUEST
          )
        }

        const classPricing = extra.pricing.find((p) => p.vehicleClassId === vehicle.data.classId)
        const price = classPricing ? classPricing.price : 0

        selectedExtraServices.push({
          serviceId: extra.id,
          name: extra.name,
          price,
        })
      }
    }

    // 5. Validate Time Window
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

    // 6. Reserve Capacity Atomically
    const reservedWindow = await this.timeWindowRepository.reserveCapacityAtomically(timeWindow.id)
    if (!reservedWindow) {
      throw new AppError(
        "Failed to reserve capacity for time window. It may have filled up.",
        HTTP_STATUS.CONFLICT
      )
    }

    // 7. Calculate Pricing & Settlement Snapshots
    const pricingResult = BookingPricingService.calculate({
      basePrice,
      extraServices: selectedExtraServices,
      paymentType: input.paymentType,
    })

    // 8. Generate Booking Number and QR Token
    const bookingNumber = BookingNumberService.generate()
    const qrResult = QRTokenService.generateToken(timeWindow.windowEnd)

    // 9. Construct Booking Aggregate Root
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
      paymentStatus:
        input.paymentType === "ONLINE_FULL" ? PaymentStatus.PAID : PaymentStatus.PENDING,
      paymentType: input.paymentType,
      depositAmount: pricingResult.depositAmount,
      cashAmount: pricingResult.cashAmount,
      refundAmount: 0,
      settlement: pricingResult.settlement,
      status: BookingStatus.CONFIRMED,
      createdAt: now,
      updatedAt: now,
    })

    // 10. Save Booking & Audit Log
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

    // 11. Dispatch Notification
    await this.notificationService.notify("BOOKING_CREATED", savedBooking)

    // 12. Return DTO with raw QR token
    return BookingDTOMapper.toDTO(savedBooking, qrResult.rawToken)
  }
}
