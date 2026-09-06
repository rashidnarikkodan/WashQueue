import { IUserRepository } from "../../domain/repositories/user.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IGetBookmarksUseCase } from "../interfaces/user-usecases.interfaces"
import { StationProps } from "@/modules/station/domain/entities/Station"

export class GetBookmarksUseCase implements IGetBookmarksUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly stationRepository: IStationRepository
  ) {}

  async execute(userId: string): Promise<StationProps[]> {
    const user = await this.userRepository.findById(userId)
    if (!user || !user.bookmarks || user.bookmarks.length === 0) {
      return []
    }

    const stations = await this.stationRepository.findByIds(user.bookmarks)
    return stations.map((s) => s.getProps())
  }
}
