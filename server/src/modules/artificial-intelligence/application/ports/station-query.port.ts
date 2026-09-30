export interface StationSummary {
  id: string
  name: string
  description?: string
  address: {
    street: string
    city: string
    state?: string
  }
  rating: number
  reviewCount: number
  isOpen: boolean
  queueDepth: number
  estimatedWaitMins: number
  bays: number
  distanceKm?: number
}

export interface StationSearchParams {
  query?: string
  latitude?: number
  longitude?: number
  radiusKm?: number
  nearby?: boolean
  lowQueue?: boolean
  minRating?: number
  limit?: number
}

export interface IStationQueryPort {
  searchStations(params: StationSearchParams): Promise<StationSummary[]>
  findStationByNameOrId(identifier: string): Promise<StationSummary | null>
}
