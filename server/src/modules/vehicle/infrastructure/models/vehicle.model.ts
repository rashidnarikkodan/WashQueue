import { Schema, model, Document, Types } from "mongoose"

export interface IVehicle extends Document {
  userId: Types.ObjectId
  nickname: string
  brand: string
  model: any
  year: number
  registrationNumber: string | null
  categoryId: Types.ObjectId
  classId: Types.ObjectId
  isPrimary: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const vehicleSchema = new Schema<IVehicle>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    nickname: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    registrationNumber: { type: String, default: null, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "VehicleCategory", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "VehicleClass", required: true },
    isPrimary: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  } as any,
  {
    timestamps: true,
  }
)

export const VehicleModel = model<IVehicle>("Vehicle", vehicleSchema)
