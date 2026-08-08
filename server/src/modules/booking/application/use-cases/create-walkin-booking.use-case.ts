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
import { IBookingNotificationService } from "../interfaces/booking-notification.interface"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { CreateWalkInBookingInput } from "../dtos/create-walkin-booking.dto"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { ICreateWalkInBookingUseCase } from "../interfaces/booking-usecases.interface"

export class CreateWalkInBookingUseCase implements ICreateWalkInBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository: IBookingStatusLogRepository,
    private readonly stationRepository: IStationRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository,
    private readonly timeWindowRepository: ITimeWindowRepository,
    private readonly notificationService: IBookingNotificationService
  ) {}

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

    // 2. Validate Pricing for vehicle class
    const pricings = await this.stationPricingRepository.findByStationId(station.id)
    const pricing = pricings.find((p) => p.vehicleClassId === input.vehicle.classId && p.isActive)
    if (!pricing) {
      throw new AppError(
        "Station does not support or have active pricing for this vehicle class",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const basePrice = input.serviceType === "FULL" ? pricing.fullWashPrice : pricing.halfWashPrice

    // 3. Validate Extra Services
    const availableExtras = await this.extraServiceRepository.findByStationId(station.id)
    const selectedExtraServices: Array<{ serviceId: string; name: string; price: number }> = []

    if (input.extraServiceIds && input.extraServiceIds.length > 0) {
      for (const extraId of input.extraServiceIds) {
        const extra = availableExtras.find((e) => e.id === extraId && e.isActive)
        if (!extra) {
          throw new AppError(
            `Extra service ${extraId} is invalid or inactive`,
            HTTP_STATUS.BAD_REQUEST
          )
        }
        const classPricing = extra.pricing.find((p) => p.vehicleClassId === input.vehicle.classId)
        selectedExtraServices.push({
          serviceId: extra.id,
          name: extra.name,
          price: classPricing ? classPricing.price : 0,
        })
      }
    }

    // 4. Validate Time Window & Walk-in Slot
    const timeWindow = await this.timeWindowRepository.findById(input.timeWindowId)
    if (!timeWindow || timeWindow.stationId !== station.id) {
      throw new AppError("Selected time window not found", HTTP_STATUS.NOT_FOUND)
    }

    timeWindow.reserveWalkInSlot()
    await this.timeWindowRepository.save(timeWindow)

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

    // 7. Create Walk-in Booking Aggregate
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
      status: BookingStatus.CHECKED_IN,
      checkedInAt: now,
      checkedInBy: managerUserId,
      createdAt: now,
      updatedAt: now,
    })

    // 8. Save Booking & Audit Log
    const savedBooking = await this.bookingRepository.save(booking)

    const statusLog = new BookingStatusLog({
      id: "",
      bookingId: savedBooking.id,
      fromStatus: null,
      toStatus: BookingStatus.CHECKED_IN,
      changedBy: managerUserId,
      reason: "Manager created walk-in booking",
      createdAt: now,
    })
    await this.bookingStatusLogRepository.save(statusLog)

    // 9. Dispatch Notification
    await this.notificationService.notify("BOOKING_CREATED", savedBooking)

    return BookingDTOMapper.toDTO(savedBooking, qrResult.rawToken)
  }
}
