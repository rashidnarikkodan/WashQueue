import { Booking } from "../../domain/entities/Booking"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { BookingResponseDTO, BookingStatusLogDTO } from "../dtos/booking-response.dto"

export class BookingDTOMapper {
  static toDTO(
    booking: Booking,
    rawQrToken?: string,
    statusLogs?: BookingStatusLog[]
  ): BookingResponseDTO {
    const props = booking.getProps()

    const mappedHistory: BookingStatusLogDTO[] | undefined = statusLogs
      ? statusLogs.map((log) => {
          const lProps = log.getProps()
          return {
            id: lProps.id,
            bookingId: lProps.bookingId,
            fromStatus: lProps.fromStatus,
            toStatus: lProps.toStatus,
            changedBy: lProps.changedBy,
            reason: lProps.reason,
            notes: lProps.notes,
            createdAt: lProps.createdAt instanceof Date ? lProps.createdAt.toISOString() : String(lProps.createdAt),
          }
        })
      : undefined

    return {
      id: props.id,
      bookingNumber: props.bookingNumber,
      userId: props.userId,
      providerId: props.providerId,
      stationId: props.stationId,
      vehicleId: props.vehicleId,
      vehicleSnapshot: props.vehicleSnapshot,
      serviceType: props.serviceType,
      pricingSnapshot: props.pricingSnapshot,
      extraServices: props.extraServices,
      scheduling: {
        timeWindowId: props.scheduling.timeWindowId,
        windowStart: props.scheduling.windowStart.toISOString(),
        windowEnd: props.scheduling.windowEnd.toISOString(),
      },
      isWalkIn: props.isWalkIn,
      walkInCustomer: props.walkInCustomer,
      walkInVehicle: props.walkInVehicle,
      rawQrToken,
      qr: {
        qrExpiresAt: props.qr.qrExpiresAt.toISOString(),
      },
      paymentStatus: props.paymentStatus,
      paymentMethod: props.paymentMethod,
      depositAmount: props.depositAmount,
      cashAmount: props.cashAmount,
      refundAmount: props.refundAmount,
      settlement: props.settlement,
      status: props.status,
      checkedInAt: props.checkedInAt ? props.checkedInAt.toISOString() : null,
      serviceStartedAt: props.serviceStartedAt ? props.serviceStartedAt.toISOString() : null,
      serviceCompletedAt: props.serviceCompletedAt ? props.serviceCompletedAt.toISOString() : null,
      handoverInitiatedAt: props.handoverInitiatedAt
        ? props.handoverInitiatedAt.toISOString()
        : null,
      completedAt: props.completedAt ? props.completedAt.toISOString() : null,
      noShowAt: props.noShowAt ? props.noShowAt.toISOString() : null,
      cancellation: props.cancellation
        ? {
            cancellationReason: props.cancellation.cancellationReason,
            cancelledBy: props.cancellation.cancelledBy,
            cancelledAt: props.cancellation.cancelledAt.toISOString(),
          }
        : null,
      stationDetails: props.stationDetails,
      vehicleDetails: props.vehicleDetails,
      customerDetails: props.customerDetails,
      preServiceInspection: props.preServiceInspection
        ? {
            photos: props.preServiceInspection.photos,
            notes: props.preServiceInspection.notes,
            capturedBy: props.preServiceInspection.capturedBy,
            capturedAt: props.preServiceInspection.capturedAt.toISOString(),
          }
        : null,
      postServiceInspection: props.postServiceInspection
        ? {
            photos: props.postServiceInspection.photos,
            notes: props.postServiceInspection.notes,
            capturedBy: props.postServiceInspection.capturedBy,
            capturedAt: props.postServiceInspection.capturedAt.toISOString(),
            checklist: props.postServiceInspection.checklist || [],
          }
        : null,
      statusHistory: mappedHistory,
      rescheduleCount: props.rescheduleCount ?? 0,
      estimatedServiceDurationMinutes: (() => {
        const base = props.serviceType === "FULL" ? 40 : 20
        const extra = (props.extraServices?.length || 0) * 5
        const modelLower = (props.vehicleDetails?.model || "").toLowerCase()
        let classMod = 0
        if (modelLower.includes("suv") || modelLower.includes("luxury") || modelLower.includes("fortuner") || modelLower.includes("endeavour")) {
          classMod = 10
        } else if (modelLower.includes("van") || modelLower.includes("heavy") || modelLower.includes("truck")) {
          classMod = 15
        }
        return base + extra + classMod
      })(),
      serviceDurationBreakdown: (() => {
        const base = props.serviceType === "FULL" ? 40 : 20
        const extra = (props.extraServices?.length || 0) * 5
        const modelLower = (props.vehicleDetails?.model || "").toLowerCase()
        let classMod = 0
        if (modelLower.includes("suv") || modelLower.includes("luxury") || modelLower.includes("fortuner") || modelLower.includes("endeavour")) {
          classMod = 10
        } else if (modelLower.includes("van") || modelLower.includes("heavy") || modelLower.includes("truck")) {
          classMod = 15
        }
        return {
          baseMinutes: base,
          extraServicesMinutes: extra,
          vehicleClassModifierMinutes: classMod,
          totalEstimatedMinutes: base + extra + classMod,
        }
      })(),
      createdAt: props.createdAt.toISOString(),
      updatedAt: props.updatedAt.toISOString(),
    }
  }
}

