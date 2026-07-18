import { Station } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repsoitory"
import { IGetStationsUseCase } from "../interfaces/station-usecases.interface"

export class GetStationsUseCase implements IGetStationsUseCase {
  constructor(private readonly stationRepository: IStationRepository) {}

  async execute(providerId: string): Promise<Station[]> {
    return this.stationRepository.findByProviderId(providerId)
  }
}
