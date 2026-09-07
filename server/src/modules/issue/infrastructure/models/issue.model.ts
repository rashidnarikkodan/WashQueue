import mongoose, { Document, Schema, Types } from "mongoose"
import { IssueStatus } from "../../domain/value-objects/issue-status.vo"
import { ResolutionType } from "../../domain/value-objects/resolution-type.vo"

export interface IEvidenceSubdocument {
  public_id: string
  url: string
  description?: string
}

export interface IIssueHistorySubdocument {
  fromStatus: string
  toStatus: string
  actionBy: Types.ObjectId
  reason?: string
  timestamp: Date
}

export interface IIssueDocument extends Document {
  _id: Types.ObjectId
  bookingId: Types.ObjectId
  customerId: Types.ObjectId
  stationId: Types.ObjectId
  assignedManagerId?: Types.ObjectId | null
  status: string
  customerDescription: string
  customerEvidence: IEvidenceSubdocument[]
  managerNotes?: string | null
  managerEvidence: IEvidenceSubdocument[]
  resolutionType?: string | null
  compensationAmount: number
  resolutionNotes?: string | null
  resolvedAt?: Date | null
  resolvedBy?: Types.ObjectId | null
  history: IIssueHistorySubdocument[]
  createdAt: Date
  updatedAt: Date
}

const EvidenceSchema = new Schema<IEvidenceSubdocument>(
  {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, default: null },
  },
  { _id: false }
)

const IssueHistorySchema = new Schema<IIssueHistorySubdocument>(
  {
    fromStatus: { type: String, required: true },
    toStatus: { type: String, required: true },
    actionBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
)

const IssueSchema = new Schema<IIssueDocument>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    stationId: {
      type: Schema.Types.ObjectId,
      ref: "Station",
      required: true,
      index: true,
    },
    assignedManagerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(IssueStatus),
      default: IssueStatus.OPEN,
      index: true,
    },
    customerDescription: {
      type: String,
      required: true,
      trim: true,
    },
    customerEvidence: {
      type: [EvidenceSchema],
      default: [],
    },
    managerNotes: {
      type: String,
      default: null,
      trim: true,
    },
    managerEvidence: {
      type: [EvidenceSchema],
      default: [],
    },
    resolutionType: {
      type: String,
      enum: [...Object.values(ResolutionType), null],
      default: null,
    },
    compensationAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    resolutionNotes: {
      type: String,
      default: null,
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    history: {
      type: [IssueHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "booking_issues",
  }
)

export const IssueModel = mongoose.model<IIssueDocument>("Issue", IssueSchema)
export default IssueModel
