import {
  StationContact,
  StationLocation,
  StationAddress,
  StationImage,
} from "../../domain/entities/Station"

export interface CreateStationInput {
  name: string
  description?: string
  contact: StationContact
  location: StationLocation
  address: StationAddress
  images?: StationImage[]
  newFiles?: Express.Multer.File[]
}
