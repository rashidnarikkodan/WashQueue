import { Types } from "mongoose"
import { BookingReservation } from "../../domain/entities/BookingReservation"
import { ServiceType, PaymentType } from "../../domain/entities/Booking"
import { IBookingReservationDocument } from "../models/booking-reservation.model"

export class BookingReservationMapper {
  static toDomain(doc: IBookingReservationDocument): BookingReservation {
    return new BookingReservation({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      stationId: doc.stationId.toString(),
      vehicleId: doc.vehicleId.toString(),
      timeWindowId: doc.timeWindowId.toString(),
      serviceType: doc.serviceType as ServiceType,
      extraServiceIds: doc.extraServiceIds || [],
      paymentType: doc.paymentType as PaymentType,
      depositAmount: doc.depositAmount,
      cashAmount: doc.cashAmount,
      totalAmount: doc.totalAmount,
      walletAmount: doc.walletAmount || 0,
      paymentOrderId: doc.razorpayOrderId,
      paymentId: doc.razorpayPaymentId,
      paymentSignature: doc.razorpaySignature,
      bookingId: doc.bookingId ? doc.bookingId.toString() : undefined,
      status: doc.status,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }

  static toPersistence(entity: BookingReservation): Record<string, unknown> {
    const raw = entity.toObject()
    const obj: Record<string, unknown> = {
      userId: Types.ObjectId.isValid(raw.userId) ? new Types.ObjectId(raw.userId) : raw.userId,
      stationId: Types.ObjectId.isValid(raw.stationId) ? new Types.ObjectId(raw.stationId) : raw.stationId,
      vehicleId: Types.ObjectId.isValid(raw.vehicleId) ? new Types.ObjectId(raw.vehicleId) : raw.vehicleId,
      timeWindowId: Types.ObjectId.isValid(raw.timeWindowId)
        ? new Types.ObjectId(raw.timeWindowId)
        : raw.timeWindowId,
      serviceType: raw.serviceType,
      extraServiceIds: raw.extraServiceIds,
      paymentType: raw.paymentType,
      depositAmount: raw.depositAmount,
      cashAmount: raw.cashAmount,
      totalAmount: raw.totalAmount,
      walletAmount: raw.walletAmount || 0,
      razorpayOrderId: raw.paymentOrderId,
      razorpayPaymentId: raw.paymentId,
      razorpaySignature: raw.paymentSignature,
      status: raw.status,
      expiresAt: raw.expiresAt,
    }

    if (raw.bookingId && Types.ObjectId.isValid(raw.bookingId)) {
      obj.bookingId = new Types.ObjectId(raw.bookingId)
    }

    if (raw.id && Types.ObjectId.isValid(raw.id)) {
      obj._id = new Types.ObjectId(raw.id)
    }

    return obj
  }
}
