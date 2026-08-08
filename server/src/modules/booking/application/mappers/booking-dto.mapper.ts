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
      paymentType: props.paymentType,
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
      statusHistory: mappedHistory,
      createdAt: props.createdAt.toISOString(),
      updatedAt: props.updatedAt.toISOString(),
    }
  }
}

