import { OperatingHour, Holiday, SlotConfiguration, StationContact, StationLocation, StationAddress, StationImage, StationStatus } from "../../domain/entities/Station"

export interface UpdateBasicInfoInput {
  name?: string
  description?: string
  contact?: StationContact
  location?: StationLocation
  address?: StationAddress
  images?: StationImage[]
  deletedImagePublicIds?: string[]
  status?: StationStatus
}

export interface UpdateAvailabilityInput {
  operatingHours: OperatingHour[]
  holidays: Holiday[]
  slotConfig: SlotConfiguration
}

export interface PricingEntryInput {
  vehicleClassId: string
  halfWashPrice: number
  fullWashPrice: number
  isActive?: boolean
}

export interface UpsertPricingInput {
  pricing: PricingEntryInput[]
}

export interface ExtraServicePricingInput {
  vehicleClassId: string
  price: number
}

export interface ExtraServiceInput {
  id?: string // if provided, update. if missing, create.
  name: string
  description?: string
  pricing: ExtraServicePricingInput[]
  isActive: boolean
  isDeleted?: boolean // if true, delete this extra service.
}

export interface UpdateAmenitiesInput {
  amenities: string[]
  extraServices?: ExtraServiceInput[]
}

export type UpdateStationInput =
  | ({ step: 1 } & UpdateBasicInfoInput)
  | ({ step: 2 } & UpdateAvailabilityInput)
  | ({ step: 3 } & UpsertPricingInput)
  | ({ step: 4 } & UpdateAmenitiesInput)
