import { Schema, model, Document, Types } from "mongoose"
import { BookingStatus, PaymentStatus, PaymentMethod } from "../../domain/entities/Booking"

// Persistence-only field (no domain behavior hangs off it), so its own small vocabulary
// lives here rather than in the domain layer — see RefundDetailsSnapshot at the repository boundary.
const REFUND_STATUS_VALUES = ["NONE", "PENDING", "PROCESSED", "FAILED"] as const

export interface IBookingDocument extends Document {
  _id: Types.ObjectId
  bookingNumber: string
  userId?: Types.ObjectId | null
  providerId: Types.ObjectId
  stationId: Types.ObjectId
  vehicleId?: Types.ObjectId | null

  vehicleSnapshot: {
    vehicleCategoryId: Types.ObjectId
    vehicleClassId: Types.ObjectId
  }

  serviceType: "HALF" | "FULL"

  pricingSnapshot: {
    basePrice: number
    extraPrice: number
    totalPrice: number
    currency: string
  }

  extraServices: Array<{
    serviceId: Types.ObjectId
    name: string
    price: number
  }>

  scheduling: {
    timeWindowId: Types.ObjectId
    windowStart: Date
    windowEnd: Date
  }

  isWalkIn: boolean

  walkInCustomer?: {
    userId?: Types.ObjectId | null
    name: string
    phone: string
  } | null

  walkInVehicle?: {
    vehicleId?: Types.ObjectId | null
    registrationNumber: string
    categoryId: Types.ObjectId
    classId: Types.ObjectId
  } | null

  createdByUserId: Types.ObjectId

  qr: {
    qrTokenHash: string
    qrExpiresAt: Date
  }

  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  depositAmount: number
  cashAmount: number
  refundAmount: number

  refundDetails?: {
    refundType?: string
    refundMethod?: string
    status?: string
    amount?: number
    reason?: string
    processedAt?: Date
    transactionId?: string
  }

  settlement: {
    platformCommission: number
    stationSettlement: number
  }

  preServiceInspection?: {
    photos: string[]
    notes?: string
    capturedBy: Types.ObjectId
    capturedAt: Date
  } | null

  postServiceInspection?: {
    photos: string[]
    notes?: string
    capturedBy: Types.ObjectId
    capturedAt: Date
    checklist?: Array<{
      key: string
      label: string
      passed: boolean
      remark?: string
    }>
  } | null

  status: BookingStatus

  stalledInfo?: {
    stalledReason: string
    stalledBy: Types.ObjectId
    stalledAt: Date
    previousStatus: "CHECKED_IN" | "IN_SERVICE"
    resolution?: string
    resolvedBy?: Types.ObjectId
    resolvedAt?: Date
  } | null

  checkedInAt?: Date | null
  checkedInBy?: Types.ObjectId | null
  serviceStartedAt?: Date | null
  serviceCompletedAt?: Date | null
  handoverInitiatedAt?: Date | null
  completedAt?: Date | null
  noShowAt?: Date | null

  cancellation?: {
    cancellationReason: string
    cancelledBy: Types.ObjectId
    cancelledAt: Date
  } | null

  rescheduleCount?: number

  createdAt: Date
  updatedAt: Date
}

const bookingSchema = new Schema<IBookingDocument>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", default: null },

    vehicleSnapshot: {
      vehicleCategoryId: { type: Schema.Types.ObjectId, required: true },
      vehicleClassId: { type: Schema.Types.ObjectId, required: true },
    },

    serviceType: { type: String, enum: ["HALF", "FULL"], required: true },

    pricingSnapshot: {
      basePrice: { type: Number, required: true },
      extraPrice: { type: Number, required: true, default: 0 },
      totalPrice: { type: Number, required: true },
      currency: { type: String, required: true, default: "INR" },
    },

    extraServices: [
      {
        serviceId: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],

    scheduling: {
      timeWindowId: {
        type: Schema.Types.ObjectId,
        ref: "TimeWindowInstance",
        required: true,
        index: true,
      },
      windowStart: { type: Date, required: true },
      windowEnd: { type: Date, required: true },
    },

    isWalkIn: { type: Boolean, required: true, default: false },

    walkInCustomer: {
      userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
      name: { type: String },
      phone: { type: String },
    },

    walkInVehicle: {
      vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", default: null },
      registrationNumber: { type: String },
      categoryId: { type: Schema.Types.ObjectId },
      classId: { type: Schema.Types.ObjectId },
    },

    createdByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    qr: {
      qrTokenHash: { type: String, required: true, unique: true, sparse: true, index: true },
      qrExpiresAt: { type: Date, required: true },
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },

    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },

    depositAmount: { type: Number, required: true, default: 0 },
    cashAmount: { type: Number, required: true, default: 0 },
    refundAmount: { type: Number, required: true, default: 0 },

    refundDetails: {
      refundType: {
        type: String,
        enum: ["FULL_REFUND", "PARTIAL_REFUND", "NO_REFUND"],
        default: null,
      },
      refundMethod: {
        type: String,
        enum: ["WALLET_REFUND", "ORIGINAL_PAYMENT_REFUND", "NONE"],
        default: null,
      },
      status: {
        type: String,
        enum: REFUND_STATUS_VALUES,
        default: "NONE",
      },
      amount: { type: Number, default: 0 },
      reason: { type: String, default: null },
      processedAt: { type: Date, default: null },
      transactionId: { type: String, default: null },
    },

    settlement: {
      platformCommission: { type: Number, required: true, default: 0 },
      stationSettlement: { type: Number, required: true, default: 0 },
    },

    preServiceInspection: {
      photos: [{ type: String }],
      notes: { type: String },
      capturedBy: { type: Schema.Types.ObjectId, ref: "User" },
      capturedAt: { type: Date },
    },

    postServiceInspection: {
      photos: [{ type: String }],
      notes: { type: String },
      capturedBy: { type: Schema.Types.ObjectId, ref: "User" },
      capturedAt: { type: Date },
      checklist: [
        {
          _id: false,
          key: { type: String, required: true },
          label: { type: String, required: true },
          passed: { type: Boolean, required: true },
          remark: { type: String },
        },
      ],
    },

    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.CONFIRMED,
      index: true,
    },

    stalledInfo: {
      stalledReason: { type: String },
      stalledBy: { type: Schema.Types.ObjectId, ref: "User" },
      stalledAt: { type: Date },
      previousStatus: { type: String, enum: [BookingStatus.CHECKED_IN, BookingStatus.IN_SERVICE] },
      resolution: { type: String },
      resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
      resolvedAt: { type: Date },
    },

    checkedInAt: { type: Date, default: null },
    checkedInBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    serviceStartedAt: { type: Date, default: null },
    serviceCompletedAt: { type: Date, default: null },
    handoverInitiatedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    noShowAt: { type: Date, default: null },

    cancellation: {
      cancellationReason: { type: String },
      cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
      cancelledAt: { type: Date },
    },

    rescheduleCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

// Compound Indexes for fast queries
bookingSchema.index({ userId: 1, status: 1 })
bookingSchema.index({ stationId: 1, status: 1 })
bookingSchema.index({ stationId: 1, "scheduling.windowStart": 1 })

export const BookingModel = model<IBookingDocument>("Booking", bookingSchema)
