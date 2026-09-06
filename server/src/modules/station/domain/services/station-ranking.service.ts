import { Station } from "../entities/Station"

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

export class StationRankingService {
  static computeScore(item: HydratedStationItem): number {
    const W_DIST = 0.35
    const W_WAIT = 0.25
    const W_RATING = 0.2
    const W_VERIFIED = 0.1
    const W_PRICE = 0.1

    const distKm = typeof item.distanceKm === "number" ? item.distanceKm : 15
    const sDist = Math.exp(-distKm / 10)

    const waitMins = Math.max(0, item.estimatedWaitMins || 0)
    const sWait = Math.max(0, 1 - waitMins / 60)

    const rating = Math.min(5, Math.max(0, item.rating || 0))
    const sRating = rating / 5

    const sVerified = item.isVerified ? 1.0 : 0.0

    const price = item.startingPrice ?? 50
    const sPrice = Math.max(0, 1 - price / 150)

    return (
      W_DIST * sDist +
      W_WAIT * sWait +
      W_RATING * sRating +
      W_VERIFIED * sVerified +
      W_PRICE * sPrice
    )
  }

  static sort(
    items: (HydratedStationItem & { halfWashPrice?: number; fullWashPrice?: number })[],
    sortBy?: string,
    sortOrder: "asc" | "desc" = "asc"
  ): (HydratedStationItem & { halfWashPrice?: number; fullWashPrice?: number })[] {
    const dir = sortOrder === "desc" ? -1 : 1

    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "DISTANCE":
        case "nearest": {
          const diff = ((a.distanceKm ?? 999) - (b.distanceKm ?? 999)) * dir
          if (diff !== 0) return diff
          return a.station.id.localeCompare(b.station.id)
        }

        case "RATING":
        case "rating": {
          if (b.rating !== a.rating) return (b.rating - a.rating) * dir
          const revDiff =
            (b.station.getProps().reviewCount - a.station.getProps().reviewCount) * dir
          if (revDiff !== 0) return revDiff
          return a.station.id.localeCompare(b.station.id)
        }

        case "WAIT_TIME":
        case "fastest": {
          const diff = (a.estimatedWaitMins - b.estimatedWaitMins) * dir
          if (diff !== 0) return diff
          return a.station.id.localeCompare(b.station.id)
        }

        case "REVIEW_COUNT":
        case "popular": {
          const diff = (b.station.getProps().reviewCount - a.station.getProps().reviewCount) * dir
          if (diff !== 0) return diff
          return a.station.id.localeCompare(b.station.id)
        }

        case "PRICE_LOW_TO_HIGH": {
          const priceA = a.halfWashPrice ?? a.startingPrice ?? 99999
          const priceB = b.halfWashPrice ?? b.startingPrice ?? 99999
          const diff = priceA - priceB
          if (diff !== 0) return diff
          return a.station.id.localeCompare(b.station.id)
        }

        case "PRICE_HIGH_TO_LOW": {
          const priceA = a.fullWashPrice ?? a.startingPrice ?? 0
          const priceB = b.fullWashPrice ?? b.startingPrice ?? 0
          const diff = priceB - priceA
          if (diff !== 0) return diff
          return a.station.id.localeCompare(b.station.id)
        }

        case "NEWEST": {
          const diff =
            (new Date(b.station.getProps().createdAt).getTime() -
              new Date(a.station.getProps().createdAt).getTime()) *
            dir
          if (diff !== 0) return diff
          return a.station.id.localeCompare(b.station.id)
        }

        case "RECOMMENDED":
        default: {
          const scoreA = a.score ?? StationRankingService.computeScore(a)
          const scoreB = b.score ?? StationRankingService.computeScore(b)
          const diff = scoreB - scoreA
          if (Math.abs(diff) > 0.0001) return diff
          return a.station.id.localeCompare(b.station.id)
        }
      }
    })
  }
}
