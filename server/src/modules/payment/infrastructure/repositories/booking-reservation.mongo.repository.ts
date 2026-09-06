import { Types, ClientSession } from "mongoose"
import { IBookingReservationRepository } from "../../domain/repositories/booking-reservation.repository"
import { BookingReservation, ReservationStatus } from "../../domain/entities/BookingReservation"
import { BookingReservationModel } from "../models/booking-reservation.model"
import { BookingReservationMapper } from "../mappers/booking-reservation.mapper"

export class BookingReservationMongoRepository implements IBookingReservationRepository {
  async save(reservation: BookingReservation, session?: unknown): Promise<BookingReservation> {
    const raw = BookingReservationMapper.toPersistence(reservation)
    if (reservation.id && Types.ObjectId.isValid(reservation.id)) {
      const updated = await BookingReservationModel.findByIdAndUpdate(
        reservation.id,
        { $set: raw },
        { new: true, upsert: true, session: session as ClientSession }
      )
      return BookingReservationMapper.toDomain(updated!)
    }

    const doc = (
      await BookingReservationModel.create([raw], { session: session as ClientSession })
    )[0]!
    return BookingReservationMapper.toDomain(doc)
  }

  async findById(id: string): Promise<BookingReservation | null> {
    if (!Types.ObjectId.isValid(id)) return null
    const doc = await BookingReservationModel.findById(id)
    return doc ? BookingReservationMapper.toDomain(doc) : null
  }

  async findByRazorpayOrderId(orderId: string): Promise<BookingReservation | null> {
    const doc = await BookingReservationModel.findOne({ razorpayOrderId: orderId })
    return doc ? BookingReservationMapper.toDomain(doc) : null
  }

  async findExpiredHeldReservations(now: Date = new Date()): Promise<BookingReservation[]> {
    const docs = await BookingReservationModel.find({
      status: "HELD",
      expiresAt: { $lt: now },
    })
    return docs.map(BookingReservationMapper.toDomain)
  }

  async updateStatus(
    id: string,
    status: ReservationStatus,
    bookingId?: string,
    razorpayPaymentId?: string
  ): Promise<BookingReservation | null> {
    if (!Types.ObjectId.isValid(id)) return null

    const update: Record<string, unknown> = { status }
    if (bookingId && Types.ObjectId.isValid(bookingId)) {
      update.bookingId = new Types.ObjectId(bookingId)
    }
    if (razorpayPaymentId) {
      update.razorpayPaymentId = razorpayPaymentId
    }

    const doc = await BookingReservationModel.findByIdAndUpdate(id, { $set: update }, { new: true })
    return doc ? BookingReservationMapper.toDomain(doc) : null
  }
}
