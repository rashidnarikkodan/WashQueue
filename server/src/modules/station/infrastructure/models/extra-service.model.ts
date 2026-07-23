import { Schema, model, Document, Types } from "mongoose"

interface IExtraServicePricingEntry {
  vehicleClassId: Types.ObjectId
  price: number
}

export interface IExtraService extends Document {
  stationId: Types.ObjectId
  name: string
  slug: string
  description?: string
  pricing: IExtraServicePricingEntry[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const extraServiceSchema = new Schema<IExtraService>(
  {
    stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    pricing: [
      {
        vehicleClassId: { type: Schema.Types.ObjectId, ref: "VehicleClass", required: true },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "extra_services" }
)

export const ExtraServiceModel = model<IExtraService>("ExtraService", extraServiceSchema)
