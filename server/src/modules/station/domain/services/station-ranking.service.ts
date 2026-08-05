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
  /**
   * Computes a deterministic multi-factor recommendation score between 0.0 and 1.0.
   * Score = 0.35 * Distance + 0.25 * WaitTime + 0.20 * Rating + 0.10 * Verified + 0.10 * Price
   */
  static computeScore(item: HydratedStationItem): number {
    const W_DIST = 0.35
    const W_WAIT = 0.25
    const W_RATING = 0.20
    const W_VERIFIED = 0.10
    const W_PRICE = 0.10

    // 1. Distance Sub-score (Exponential decay: 0km => 1.0, 10km => ~0.36, 25km => ~0.08)
    const distKm = typeof item.distanceKm === "number" ? item.distanceKm : 15
    const sDist = Math.exp(-distKm / 10)

    // 2. Wait Time Sub-score (0 mins => 1.0, 60+ mins => 0.0)
    const waitMins = Math.max(0, item.estimatedWaitMins || 0)
    const sWait = Math.max(0, 1 - waitMins / 60)

    // 3. Rating Sub-score (5.0 => 1.0)
    const rating = Math.min(5, Math.max(0, item.rating || 0))
    const sRating = rating / 5

    // 4. Verification Sub-score
    const sVerified = item.isVerified ? 1.0 : 0.0

    // 5. Price Sub-score (Lower starting price relative to $150 benchmark scores higher)
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

  /**
   * Sorts array of HydratedStationItem deterministically based on sortBy parameter.
   */
  static sort(items: HydratedStationItem[], sortBy?: string, sortOrder: "asc" | "desc" = "asc"): HydratedStationItem[] {
    const dir = sortOrder === "desc" ? -1 : 1

    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "DISTANCE":
        case "nearest":
          return ((a.distanceKm ?? 999) - (b.distanceKm ?? 999)) * dir

        case "RATING":
        case "rating":
          if (b.rating !== a.rating) return (b.rating - a.rating) * dir
          return (b.station.getProps().reviewCount - a.station.getProps().reviewCount) * dir

        case "WAIT_TIME":
        case "fastest":
          return (a.estimatedWaitMins - b.estimatedWaitMins) * dir

        case "REVIEW_COUNT":
        case "popular":
          return (b.station.getProps().reviewCount - a.station.getProps().reviewCount) * dir

        case "PRICE_LOW_TO_HIGH":
          return ((a.startingPrice ?? 999) - (b.startingPrice ?? 999)) * dir

        case "PRICE_HIGH_TO_LOW":
          return ((b.startingPrice ?? 0) - (a.startingPrice ?? 0)) * dir

        case "NEWEST":
          return (new Date(b.station.getProps().createdAt).getTime() - new Date(a.station.getProps().createdAt).getTime()) * dir

        case "RECOMMENDED":
        default: {
          // Sort by computed smart score descending
          const scoreA = a.score ?? StationRankingService.computeScore(a)
          const scoreB = b.score ?? StationRankingService.computeScore(b)
          return scoreB - scoreA
        }
      }
    })
  }
}
