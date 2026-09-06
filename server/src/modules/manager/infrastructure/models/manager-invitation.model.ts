import { Schema, model, Document, Types } from "mongoose"
import { ManagerInvitationStatus } from "../../domain/entities/ManagerInvitation"

export interface IManagerInvitation extends Document {
  email: string
  name?: string
  stationId: Types.ObjectId
  ownerId: Types.ObjectId
  permissions: string[]
  token: string
  status: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const managerInvitationSchema = new Schema<IManagerInvitation>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    name: { type: String, trim: true },
    stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    permissions: [{ type: String, required: true }],
    token: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: Object.values(ManagerInvitationStatus),
      default: ManagerInvitationStatus.PENDING,
      index: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: "manager_invitations" }
)

export const ManagerInvitationModel = model<IManagerInvitation>(
  "ManagerInvitation",
  managerInvitationSchema
)
