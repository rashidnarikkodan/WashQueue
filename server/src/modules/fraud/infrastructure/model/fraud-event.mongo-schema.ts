import { Schema, model, Document } from "mongoose"
import {
  RiskLevel,
  ActorType,
  EntityType,
  FraudEventStatus,
} from "../../domain/value-objects/fraud-types.vo"

export interface IFraudEventDoc extends Document {
  userId: string
  actorType: ActorType
  entityType: EntityType
  entityId: string
  eventType: string
  riskScore: number
  riskLevel: RiskLevel
  signals: Array<{
    code: string
    description: string
    score: number
    metadata?: Record<string, unknown>
  }>
  reason: string
  status: FraudEventStatus
  metadata?: Record<string, unknown>
  resolvedAt?: Date | null
  resolvedBy?: string | null
  resolutionNotes?: string | null
  createdAt: Date
  updatedAt: Date
}

const FraudSignalSchema = new Schema(
  {
    code: { type: String, required: true },
    description: { type: String, required: true },
    score: { type: Number, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: false }
)

export const FraudEventSchema = new Schema<IFraudEventDoc>(
  {
    userId: { type: String, required: true, index: true },
    actorType: {
      type: String,
      enum: Object.values(ActorType),
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: Object.values(EntityType),
      required: true,
      index: true,
    },
    entityId: { type: String, required: true, index: true },
    eventType: { type: String, required: true, index: true },
    riskScore: { type: Number, required: true, min: 0, max: 100, index: true },
    riskLevel: {
      type: String,
      enum: Object.values(RiskLevel),
      required: true,
      index: true,
    },
    signals: [FraudSignalSchema],
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(FraudEventStatus),
      default: FraudEventStatus.OPEN,
      index: true,
    },
    metadata: { type: Schema.Types.Mixed },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: String, default: null },
    resolutionNotes: { type: String, default: null },
  },
  {
    timestamps: true,
    collection: "fraud_events",
  }
)

FraudEventSchema.index({ status: 1, riskLevel: 1, createdAt: -1 })
FraudEventSchema.index({ userId: 1, createdAt: -1 })
FraudEventSchema.index({ "metadata.stationId": 1, createdAt: -1 })

export const FraudEventModel = model<IFraudEventDoc>("FraudEvent", FraudEventSchema)
