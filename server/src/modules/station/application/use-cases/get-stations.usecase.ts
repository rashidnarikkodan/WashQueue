import { Station } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { IGetStationsUseCase } from "../interfaces/station-usecases.interface"
import { GetStationsQuery, StationStatusCounts } from "../dtos/get-stations.dto"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"

export class GetStationsUseCase implements IGetStationsUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly userRepository?: IUserRepository
  ) {}

  async execute(
    query: GetStationsQuery = {},
    userId?: string
  ): Promise<{ stations: Station[]; total: number; statusCounts?: StationStatusCounts }> {
    const result = await this.stationRepository.findAll(query)

    let userBookmarks: Set<string> = new Set()

    if (userId && this.userRepository) {
      const user = await this.userRepository.findById(userId)
      if (user && Array.isArray(user.bookmarks)) {
        userBookmarks = new Set(user.bookmarks)
      }
    }

    result.stations.forEach((station) => {
      station.setFavorite(userBookmarks.has(station.id))
    })

    return result
  }
}
