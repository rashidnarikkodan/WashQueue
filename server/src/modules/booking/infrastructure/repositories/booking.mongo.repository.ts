import { Types } from "mongoose"
import { Booking, BookingStatus } from "../../domain/entities/Booking"
import { FindUserBookingsFilter, IBookingRepository } from "../../domain/repositories/booking.repository"
import { BookingModel } from "../models/booking.model"
import { BookingMapper } from "../mappers/booking.mapper"

export class BookingMongoRepository implements IBookingRepository {
  async findById(id: string): Promise<Booking | null> {
    if (!Types.ObjectId.isValid(id)) return null
    const doc = await BookingModel.findById(id)
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")
    if (!doc) return null
    return BookingMapper.toDomain(doc)
  }

  async findByBookingNumber(bookingNumber: string): Promise<Booking | null> {
    const doc = await BookingModel.findOne({ bookingNumber })
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")
    if (!doc) return null
    return BookingMapper.toDomain(doc)
  }

  async findByQrTokenHash(qrTokenHash: string): Promise<Booking | null> {
    const doc = await BookingModel.findOne({ "qr.qrTokenHash": qrTokenHash })
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")
    if (!doc) return null
    return BookingMapper.toDomain(doc)
  }

  async findByUserId(filter: FindUserBookingsFilter): Promise<Booking[]> {
    if (!Types.ObjectId.isValid(filter.userId)) return []

    const query: Record<string, unknown> = {
      userId: new Types.ObjectId(filter.userId),
    }

    if (filter.status) {
      if (Array.isArray(filter.status)) {
        query.status = { $in: filter.status }
      } else {
        query.status = filter.status
      }
    }

    if (filter.upcomingOnly) {
      query.status = {
        $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.IN_SERVICE],
      }
    } else if (filter.historyOnly) {
      query.status = {
        $in: [
          BookingStatus.SERVICE_COMPLETED,
          BookingStatus.AWAITING_HANDOVER,
          BookingStatus.COMPLETED,
          BookingStatus.CANCELLED,
          BookingStatus.NO_SHOW,
        ],
      }
    }

    const docs = await BookingModel.find(query)
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")
      .sort({ "scheduling.windowStart": -1, createdAt: -1 })
    return docs.map(BookingMapper.toDomain)
  }

  async findByStationId(stationId: string, status?: BookingStatus): Promise<Booking[]> {
    if (!Types.ObjectId.isValid(stationId)) return []

    const query: Record<string, unknown> = {
      stationId: new Types.ObjectId(stationId),
    }

    if (status) {
      query.status = status
    }

    const docs = await BookingModel.find(query)
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")
      .sort({ "scheduling.windowStart": 1 })
    return docs.map(BookingMapper.toDomain)
  }

  async save(booking: Booking): Promise<Booking> {
    const raw = BookingMapper.toPersistence(booking)
    const created = await BookingModel.create(raw)
    const doc = await BookingModel.findById(created._id)
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")
    return BookingMapper.toDomain(doc || created)
  }

  async update(booking: Booking): Promise<Booking> {
    if (!Types.ObjectId.isValid(booking.id)) {
      throw new Error("Invalid Booking ID for update")
    }

    const raw = BookingMapper.toPersistence(booking)
    const updated = await BookingModel.findByIdAndUpdate(
      booking.id,
      { $set: raw },
      { new: true }
    )
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")

    if (!updated) {
      throw new Error(`Booking ${booking.id} not found for update`)
    }

    return BookingMapper.toDomain(updated)
  }
}
