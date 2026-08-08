import { Types } from "mongoose"
import { Booking, BookingStatus } from "../../domain/entities/Booking"
import {
  FindBookingsFilter,
  FindBookingsResult,
  FindUserBookingsFilter,
  IBookingRepository,
} from "../../domain/repositories/booking.repository"
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
        $in: [
          BookingStatus.PENDING,
          BookingStatus.CONFIRMED,
          BookingStatus.CHECKED_IN,
          BookingStatus.IN_SERVICE,
        ],
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

  async findBookings(filter: FindBookingsFilter): Promise<FindBookingsResult> {
    const query: Record<string, unknown> = {}

    if (filter.userId && Types.ObjectId.isValid(filter.userId)) {
      query.userId = new Types.ObjectId(filter.userId)
    }

    if (filter.stationId && Types.ObjectId.isValid(filter.stationId)) {
      query.stationId = new Types.ObjectId(filter.stationId)
    } else if (filter.stationIds && filter.stationIds.length > 0) {
      const validStationIds = filter.stationIds
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id))
      if (validStationIds.length > 0) {
        query.stationId = { $in: validStationIds }
      }
    }

    if (filter.providerId && Types.ObjectId.isValid(filter.providerId)) {
      query.providerId = new Types.ObjectId(filter.providerId)
    }

    if (filter.status) {
      if (Array.isArray(filter.status)) {
        query.status = { $in: filter.status }
      } else {
        query.status = filter.status
      }
    } else if (filter.upcomingOnly) {
      query.status = {
        $in: [
          BookingStatus.PENDING,
          BookingStatus.CONFIRMED,
          BookingStatus.CHECKED_IN,
          BookingStatus.IN_SERVICE,
        ],
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

    if (filter.startDate || filter.endDate) {
      const dateFilter: Record<string, Date> = {}
      if (filter.startDate) dateFilter.$gte = new Date(filter.startDate)
      if (filter.endDate) dateFilter.$lte = new Date(filter.endDate)
      query["scheduling.windowStart"] = dateFilter
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.trim()
      const searchRegex = new RegExp(q, "i")

      const orConditions: Array<Record<string, unknown>> = [
        { bookingNumber: searchRegex },
        { "walkInCustomer.name": searchRegex },
        { "walkInCustomer.phone": searchRegex },
        { "walkInVehicle.registrationNumber": searchRegex },
      ]

      try {
        const { User } = await import("@/modules/user/infrastructure/model/user.model")
        const matchingUsers = await User.find({
          $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
        })
          .select("_id")
          .lean()
        if (matchingUsers.length > 0) {
          orConditions.push({ userId: { $in: matchingUsers.map((u) => u._id) } })
        }
      } catch {
        // Ignore user lookup error if module fails
      }

      try {
        const { VehicleModel } = await import(
          "@/modules/vehicle/infrastructure/models/vehicle.model"
        )
        const matchingVehicles = await VehicleModel.find({
          $or: [
            { registrationNumber: searchRegex },
            { nickname: searchRegex },
            { brand: searchRegex },
            { vehicle_model: searchRegex },
          ],
        } as Record<string, unknown>)
          .select("_id")
          .lean()
        if (matchingVehicles.length > 0) {
          orConditions.push({ vehicleId: { $in: matchingVehicles.map((v) => v._id) } })
        }
      } catch {
        // Ignore vehicle lookup error if module fails
      }

      query.$or = orConditions
    }

    const page = Math.max(1, filter.page || 1)
    const limit = Math.max(1, Math.min(100, filter.limit || 10))
    const skip = (page - 1) * limit

    const [docs, total] = await Promise.all([
      BookingModel.find(query)
        .populate("stationId")
        .populate("vehicleId")
        .populate("userId")
        .sort({ "scheduling.windowStart": -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BookingModel.countDocuments(query),
    ])

    return {
      bookings: docs.map(BookingMapper.toDomain),
      total,
    }
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
    const updated = await BookingModel.findByIdAndUpdate(booking.id, { $set: raw }, { new: true })
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")

    if (!updated) {
      throw new Error(`Booking ${booking.id} not found for update`)
    }

    return BookingMapper.toDomain(updated)
  }
}
