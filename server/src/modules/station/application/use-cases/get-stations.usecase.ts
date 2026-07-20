import { Station } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { IGetStationsUseCase } from "../interfaces/station-usecases.interface"
import { GetStationsQuery } from "../dtos/get-stations.dto"

export class GetStationsUseCase implements IGetStationsUseCase {
  constructor(
    private readonly stationRepository: IStationRepository
  ) {}

  async execute(query: GetStationsQuery = {}): Promise<Station[]> {
    return this.stationRepository.findAll(query)
  }
}