import { Schema, model, Document } from "mongoose"

export interface IVehicleCategory extends Document {
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<IVehicleCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

export const VehicleCategoryModel = model<IVehicleCategory>(
  "VehicleCategory",
  categorySchema,
  "categories"
)
