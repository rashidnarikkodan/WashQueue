import { Schema, model, Document, Types } from "mongoose"

export interface IVehicleClass extends Document {
  categoryId: Types.ObjectId
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const classSchema = new Schema<IVehicleClass>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: "VehicleCategory", required: true },
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
  }
)

export const VehicleClassModel = model<IVehicleClass>("VehicleClass", classSchema, "classes")
