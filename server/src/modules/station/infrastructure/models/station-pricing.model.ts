import { Schema, model, Document, Types } from "mongoose"

export interface IStationPricing extends Document {
  stationId: Types.ObjectId
  vehicleClassId: Types.ObjectId
  halfWashPrice: number
  fullWashPrice: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const stationPricingSchema = new Schema<IStationPricing>(
  {
    stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    vehicleClassId: { type: Schema.Types.ObjectId, ref: "VehicleClass", required: true },
    halfWashPrice: { type: Number, required: true, min: 0 },
    fullWashPrice: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "station_pricing" }
)

stationPricingSchema.index({ stationId: 1, vehicleClassId: 1 }, { unique: true })

export const StationPricingModel = model<IStationPricing>("StationPricing", stationPricingSchema)
