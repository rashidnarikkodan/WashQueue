import { Station } from "../entities/Station"

export interface StationLiveState {
  queueDepth: number
  estimatedWaitMins: number
  isOpen: boolean
}

export interface HydratedStationItem {
  station: Station
  distanceKm?: number
  startingPrice?: number
  queueDepth: number
  estimatedWaitMins: number
  isVerified: boolean
  rating: number
  score?: number
}
