import { IBaseRepository } from "@/core/domain/repository.interface"
import { Station } from "../entities/Station"

export interface StationFilter {
  ownerId?: string
  status?: string
  city?: string
  state?: string
  country?: string
  isActive?: boolean
  search?: string
  
  // Pricing
  vehicleClassId?: string
  minHalfWashPrice?: number
  maxHalfWashPrice?: number
  minFullWashPrice?: number
  maxFullWashPrice?: number

  // Extra Services
  extraServiceIds?: string[]

  // Ratings
  minimumRating?: number

  // Pagination
  page?: number
  limit?: number

  // Sorting
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface NearbyStationFilter {
  latitude: number
  longitude: number
  radiusKm: number
  
  vehicleClassId?: string
  extraServiceIds?: string[]
  minimumRating?: number

  minHalfWashPrice?: number
  maxHalfWashPrice?: number
  minFullWashPrice?: number
  maxFullWashPrice?: number

  page?: number
  limit?: number
}

export interface IStationRepository extends IBaseRepository<Station> {
  findByOwnerId(ownerId: string): Promise<Station[]>
  findByName(name: string): Promise<Station | null>
  findAll(filter: StationFilter): Promise<Station[]>
  findNearby(filter: NearbyStationFilter): Promise<Station[]>
}
