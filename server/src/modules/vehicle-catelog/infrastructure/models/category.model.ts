import { Schema, model, Document } from "mongoose"

export interface IVehicleCategory extends Document {
  name: string
  slug: string
  order: number
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<IVehicleCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

export const VehicleCategoryModel = model<IVehicleCategory>("VehicleCategory", categorySchema, "categories")
