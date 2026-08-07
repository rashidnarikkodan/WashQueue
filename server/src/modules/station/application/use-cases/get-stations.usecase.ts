import { Station } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { IGetStationsUseCase } from "../interfaces/station-usecases.interface"
import { GetStationsQuery } from "../dtos/get-stations.dto"

import { StationStatusCounts } from "../dtos/get-stations.dto"

export class GetStationsUseCase implements IGetStationsUseCase {
  constructor(
    private readonly stationRepository: IStationRepository
  ) {}

  async execute(query: GetStationsQuery = {}): Promise<{ stations: Station[]; total: number; statusCounts?: StationStatusCounts }> {
    return this.stationRepository.findAll(query)
  }
}