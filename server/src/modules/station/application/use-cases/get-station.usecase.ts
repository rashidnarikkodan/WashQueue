import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { Station } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repsoitory"
import { IGetStationUseCase } from "../interfaces/station-usecases.interface"

export class GetStationUseCase implements IGetStationUseCase {
  constructor(private readonly stationRepository: IStationRepository) {}

  async execute(stationId: string, ownerId: string): Promise<Station> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    if (station.ownerId !== ownerId) {
      throw new ForbiddenError("You are not authorized to view this station")
    }

    return station
  }
}
