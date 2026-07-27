import { StationFilter } from "../../domain/repositories/station.repository"

export type GetStationsQuery = StationFilter & {
  latitude?: number
  longitude?: number
  maxDistanceKm?: number
}