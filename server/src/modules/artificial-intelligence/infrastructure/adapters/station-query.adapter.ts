import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { StationRedisHydrationService } from "@/modules/station/infrastructure/services/station-redis-hydration.service"
import { Station } from "@/modules/station/domain/entities/Station"
import {
  IStationQueryPort,
  StationSearchParams,
  StationSummary,
} from "../../application/ports/station-query.port"

export class StationQueryAdapter implements IStationQueryPort {
  constructor(private readonly stationRepository: IStationRepository) {}

  async searchStations(params: StationSearchParams): Promise<StationSummary[]> {
    let stations: Station[] = []

    if (params.latitude !== undefined && params.longitude !== undefined) {
      try {
        stations = await this.stationRepository.findNearby({
          latitude: params.latitude,
          longitude: params.longitude,
          radiusKm: params.radiusKm ?? 25,
          minimumRating: params.minRating,
        })
      } catch {
        stations = []
      }
    }

    if (stations.length === 0) {
      const result = await this.stationRepository.findAll({
        limit: 50,
      })
      stations = result.stations.filter((s) => s.isActive && s.status === "ACTIVE")
    }

    if (params.query && params.query.trim()) {
      const q = params.query.trim().toLowerCase()
      const filtered = stations.filter((s) => {
        const nameMatch = s.name.toLowerCase().includes(q) || q.includes(s.name.toLowerCase())
        const cityMatch =
          s.address.city.toLowerCase().includes(q) || q.includes(s.address.city.toLowerCase())
        return nameMatch || cityMatch
      })
      if (filtered.length > 0) {
        stations = filtered
      }
    }

    const liveStates = await StationRedisHydrationService.hydrateLiveStates(stations)

    const summaries: StationSummary[] = stations.map((s) => {
      const live = liveStates.get(s.id)
      const props = s.getProps()
      return {
        id: s.id,
        name: s.name,
        description: s.description,
        address: {
          street: s.address.street,
          city: s.address.city,
          state: s.address.state,
        },
        rating: s.rating,
        reviewCount: s.reviewCount,
        isOpen: live?.isOpen ?? StationRedisHydrationService.checkIsOpen(s),
        queueDepth: live?.queueDepth ?? 0,
        estimatedWaitMins: live?.estimatedWaitMins ?? 0,
        bays: props.slotConfig?.bays ?? 1,
      }
    })

    // Deterministic ranking:
    // 1. Open stations first
    // 2. If lowQueue preferred, lowest wait time / queue depth
    // 3. Higher rating
    summaries.sort((a, b) => {
      if (a.isOpen !== b.isOpen) {
        return a.isOpen ? -1 : 1
      }
      if (params.lowQueue) {
        if (a.estimatedWaitMins !== b.estimatedWaitMins) {
          return a.estimatedWaitMins - b.estimatedWaitMins
        }
      }
      return b.rating - a.rating
    })

    const limit = params.limit ?? 5
    return summaries.slice(0, limit)
  }

  async findStationByNameOrId(identifier: string): Promise<StationSummary | null> {
    if (!identifier || !identifier.trim()) return null
    const cleanId = identifier.trim()

    let station = await this.stationRepository.findById(cleanId)
    if (!station) {
      station = await this.stationRepository.findByName(cleanId)
    }

    if (!station) {
      // Fuzzy match across active stations
      const result = await this.stationRepository.findAll({ limit: 100 })
      const lower = cleanId.toLowerCase()
      station = result.stations.find((s) => s.name.toLowerCase().includes(lower)) ?? null
    }

    if (!station) return null

    const liveStates = await StationRedisHydrationService.hydrateLiveStates([station])
    const live = liveStates.get(station.id)
    const props = station.getProps()

    return {
      id: station.id,
      name: station.name,
      description: station.description,
      address: {
        street: station.address.street,
        city: station.address.city,
        state: station.address.state,
      },
      rating: station.rating,
      reviewCount: station.reviewCount,
      isOpen: live?.isOpen ?? StationRedisHydrationService.checkIsOpen(station),
      queueDepth: live?.queueDepth ?? 0,
      estimatedWaitMins: live?.estimatedWaitMins ?? 0,
      bays: props.slotConfig?.bays ?? 1,
    }
  }
}
