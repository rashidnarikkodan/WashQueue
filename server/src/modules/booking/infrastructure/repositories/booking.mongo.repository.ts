import { Types, ClientSession } from "mongoose"
import { Booking, BookingStatus, PaymentStatus } from "../../domain/entities/Booking"
import {
  FindBookingsFilter,
  FindBookingsResult,
  FindUserBookingsFilter,
  IBookingRepository,
  RefundDetailsSnapshot,
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
    } else if (filter.noShowOnly) {
      query.status = BookingStatus.NO_SHOW
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

    if (filter.ownerId && Types.ObjectId.isValid(filter.ownerId)) {
      query.ownerId = new Types.ObjectId(filter.ownerId)
    }

    if (filter.status) {
      if (Array.isArray(filter.status)) {
        query.status = { $in: filter.status }
      } else {
        query.status = filter.status
      }
    } else if (filter.noShowOnly) {
      query.status = BookingStatus.NO_SHOW
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
      }

      query.$or = orConditions
    }

    const page = Math.max(1, filter.page || 1)
    const limit = Math.max(1, Math.min(100, filter.limit || 10))
    const skip = (page - 1) * limit

    const [docs, total] = await Promise.all([
      BookingModel.aggregate([
        { $match: query },
        {
          $addFields: {
            statusPriority: {
              $switch: {
                branches: [
                  {
                    case: {
                      $in: ["$status", [BookingStatus.IN_SERVICE, BookingStatus.CHECKED_IN]],
                    },
                    then: 1,
                  },
                  {
                    case: {
                      $in: ["$status", [BookingStatus.CONFIRMED, BookingStatus.PENDING]],
                    },
                    then: 2,
                  },
                  {
                    case: {
                      $in: [
                        "$status",
                        [BookingStatus.SERVICE_COMPLETED, BookingStatus.AWAITING_HANDOVER],
                      ],
                    },
                    then: 3,
                  },
                  { case: { $eq: ["$status", BookingStatus.COMPLETED] }, then: 4 },
                  {
                    case: {
                      $in: ["$status", [BookingStatus.NO_SHOW, BookingStatus.CANCELLED]],
                    },
                    then: 5,
                  },
                ],
                default: 6,
              },
            },
          },
        },
        {
          $sort: {
            statusPriority: 1,
            "scheduling.windowStart": 1,
            createdAt: -1,
          },
        },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "stations",
            localField: "stationId",
            foreignField: "_id",
            as: "stationId",
          },
        },
        { $unwind: { path: "$stationId", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "vehicles",
            localField: "vehicleId",
            foreignField: "_id",
            as: "vehicleId",
          },
        },
        { $unwind: { path: "$vehicleId", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
      ]),
      BookingModel.countDocuments(query),
    ])

    return {
      bookings: docs.map(BookingMapper.toDomain),
      total,
    }
  }

  async save(booking: Booking, session?: unknown): Promise<Booking> {
    const raw = BookingMapper.toPersistence(booking)
    const created = (await BookingModel.create([raw], { session: session as ClientSession }))[0]!
    const doc = await BookingModel.findById(created._id)
      .session((session as ClientSession) || null)
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

  async updateWithStatusGuard(
    booking: Booking,
    expectedCurrentStatus: BookingStatus | BookingStatus[],
    session?: unknown
  ): Promise<Booking | null> {
    if (!Types.ObjectId.isValid(booking.id)) {
      throw new Error("Invalid Booking ID for update")
    }

    const statusFilter = Array.isArray(expectedCurrentStatus)
      ? { $in: expectedCurrentStatus }
      : expectedCurrentStatus

    const raw = BookingMapper.toPersistence(booking)
    const updated = await BookingModel.findOneAndUpdate(
      { _id: booking.id, status: statusFilter },
      { $set: raw },
      { new: true, session: session as ClientSession }
    )
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")

    if (!updated) return null
    return BookingMapper.toDomain(updated)
  }

  async countByStationAndStatus(stationId: string, status: BookingStatus): Promise<number> {
    if (!Types.ObjectId.isValid(stationId)) return 0
    return BookingModel.countDocuments({
      stationId: new Types.ObjectId(stationId),
      status,
    }).exec()
  }

  async findNoShowCandidates(graceCutoff: Date): Promise<Booking[]> {
    const docs = await BookingModel.find({
      status: BookingStatus.CONFIRMED,
      isWalkIn: { $ne: true },
      noShowAt: null,
      "scheduling.windowEnd": { $lt: graceCutoff },
    })
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")
      .exec()
    return docs.map(BookingMapper.toDomain)
  }

  async getRefundDetails(bookingId: string): Promise<RefundDetailsSnapshot | null> {
    if (!Types.ObjectId.isValid(bookingId)) return null
    const doc = await BookingModel.findById(bookingId).select("refundDetails").exec()
    if (!doc?.refundDetails) return null

    return {
      refundType: doc.refundDetails.refundType || "NONE",
      refundMethod: doc.refundDetails.refundMethod || "WALLET",
      status: (doc.refundDetails.status as RefundDetailsSnapshot["status"]) || "NONE",
      amount: doc.refundDetails.amount || 0,
      reason: doc.refundDetails.reason || "",
      transactionId: doc.refundDetails.transactionId || null,
    }
  }

  async applyRefund(
    bookingId: string,
    refund: RefundDetailsSnapshot,
    newPaymentStatus: PaymentStatus
  ): Promise<Booking | null> {
    if (!Types.ObjectId.isValid(bookingId)) return null

    const now = new Date()
    const updated = await BookingModel.findOneAndUpdate(
      {
        _id: bookingId,
        "refundDetails.status": { $ne: "PROCESSED" },
      },
      {
        $set: {
          refundAmount: refund.amount,
          paymentStatus: newPaymentStatus,
          refundDetails: {
            refundType: refund.refundType,
            refundMethod: refund.refundMethod,
            status: refund.status,
            amount: refund.amount,
            reason: refund.reason,
            processedAt: now,
            transactionId: refund.transactionId,
          },
          updatedAt: now,
        },
      },
      { new: true }
    )
      .populate("stationId")
      .populate("vehicleId")
      .populate("userId")

    if (!updated) return null
    return BookingMapper.toDomain(updated)
  }
}
