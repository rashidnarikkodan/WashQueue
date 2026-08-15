import { Schema, model, Document, Types } from "mongoose"
import { ManagerAssignmentStatus } from "../../domain/entities/ManagerAssignment"

export interface IManagerAssignment extends Document {
  managerUserId: Types.ObjectId
  stationId: Types.ObjectId
  ownerId: Types.ObjectId
  permissions: string[]
  status: string
  assignedAt: Date
  createdAt: Date
  updatedAt: Date
}

const managerAssignmentSchema = new Schema<IManagerAssignment>(
  {
    managerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    permissions: [{ type: String, required: true }],
    status: {
      type: String,
      enum: Object.values(ManagerAssignmentStatus),
      default: ManagerAssignmentStatus.ACTIVE,
      index: true,
    },
    assignedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "manager_assignments" }
)

managerAssignmentSchema.index({ managerUserId: 1, stationId: 1 }, { unique: true })

// Business rules enforced at the DB layer (not just in application code) so concurrent
// invite/accept requests can't both succeed and violate them:
// Rule 1 — a station can have at most one ACTIVE manager assignment at a time.
managerAssignmentSchema.index(
  { stationId: 1 },
  { unique: true, partialFilterExpression: { status: ManagerAssignmentStatus.ACTIVE } }
)
// Rule 2 — a manager can have at most one ACTIVE assignment (one station) at a time.
managerAssignmentSchema.index(
  { managerUserId: 1 },
  { unique: true, partialFilterExpression: { status: ManagerAssignmentStatus.ACTIVE } }
)

export const ManagerAssignmentModel = model<IManagerAssignment>(
  "ManagerAssignment",
  managerAssignmentSchema
)
