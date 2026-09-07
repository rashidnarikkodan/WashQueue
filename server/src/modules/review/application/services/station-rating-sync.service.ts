import logger from "@/configs/logger.config"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IReviewRepository } from "../../domain/repositories/review.repository.interface"
import { IStationRatingSyncService } from "../interfaces/station-rating-sync.interface"

export class StationRatingSyncService implements IStationRatingSyncService {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly stationRepository?: IStationRepository
  ) {}

  async syncStationRating(stationId: string): Promise<void> {
    if (!this.stationRepository || !stationId) {
      return
    }

    try {
      const summary = await this.reviewRepository.getStationRatingSummary(stationId)
      const station = await this.stationRepository.findById(stationId)

      if (station) {
        station.updateRating(summary.averageRating, summary.reviewCount)
        await this.stationRepository.save(station)
        logger.info(
          { stationId, averageRating: summary.averageRating, reviewCount: summary.reviewCount },
          "[StationRatingSyncService] Station rating updated successfully"
        )
      }
    } catch (error) {
      logger.error({ error, stationId }, "[StationRatingSyncService] Failed to sync station rating")
    }
  }
}
