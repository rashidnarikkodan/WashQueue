import redis from "@/infrastructure/cache/redis.client"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { StationRedisHydrationService } from "@/modules/station/infrastructure/services/station-redis-hydration.service"
import { IQueueQueryPort, StationLiveQueueData } from "../../application/ports/queue-query.port"

export class QueueQueryAdapter implements IQueueQueryPort {
  constructor(private readonly stationRepository: IStationRepository) {}

  async findStationByName(name: string): Promise<{ id: string; name: string } | null> {
    if (!name || !name.trim()) return null
    const clean = name.trim().toLowerCase()

    const direct = await this.stationRepository.findByName(name.trim())
    if (direct) {
      return { id: direct.id, name: direct.name }
    }

    const all = await this.stationRepository.findAll({ limit: 100 })
    const match = all.stations.find(
      (s) => s.name.toLowerCase().includes(clean) || clean.includes(s.name.toLowerCase())
    )

    if (match) {
      return { id: match.id, name: match.name }
    }

    return null
  }

  async getStationQueue(stationId: string): Promise<StationLiveQueueData | null> {
    if (!stationId) return null

    const station = await this.stationRepository.findById(stationId)
    if (!station) return null

    const props = station.getProps()
    const totalBays = props.slotConfig?.bays ?? 1
    const isOpen = StationRedisHydrationService.checkIsOpen(station)

    try {
      const raw = await redis.get(`station:live:${stationId}`)
      if (raw) {
        const parsed = JSON.parse(raw) as {
          queueDepth?: number
          estimatedWaitMins?: number
          isOpen?: boolean
          activeServicesCount?: number
          availableBays?: number
        }

        const queueDepth = parsed.queueDepth ?? 0
        const estimatedWaitMins = parsed.estimatedWaitMins ?? 0
        const activeServicesCount = parsed.activeServicesCount ?? 0
        const availableBays = parsed.availableBays ?? Math.max(0, totalBays - activeServicesCount)

        return {
          stationId: station.id,
          stationName: station.name,
          isOpen: parsed.isOpen ?? isOpen,
          queueDepth,
          estimatedWaitMins,
          totalBays,
          availableBays,
          activeServicesCount,
          isLive: true,
        }
      }
    } catch {
      // Redis lookup failure handled gracefully
    }

    // If live data in Redis is missing or unavailable, fallback to deterministic station schedule state
    return {
      stationId: station.id,
      stationName: station.name,
      isOpen,
      queueDepth: 0,
      estimatedWaitMins: 0,
      totalBays,
      availableBays: totalBays,
      activeServicesCount: 0,
      isLive: false,
    }
  }
}
