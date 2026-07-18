import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { IStationRepository } from "../../domain/repositories/station.repsoitory"
import { IStationPricingRepository } from "../../domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "../../domain/repositories/extra-service.repository"
import { StationDetailResponseDto } from "../dtos/get-station.dto"
import { IGetStationUseCase } from "../interfaces/station-usecases.interface"

export class GetStationUseCase implements IGetStationUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository
  ) {}

  async execute(stationId: string, providerId: string): Promise<StationDetailResponseDto> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    if (station.providerId !== providerId) {
      throw new ForbiddenError("You are not authorized to view this station")
    }

    const pricing = await this.stationPricingRepository.findByStationId(stationId)
    const extraServices = await this.extraServiceRepository.findByStationId(stationId)

    return {
      station: station.getProps(),
      pricing: pricing.map((p) => p.getProps()),
      extraServices: extraServices.map((es) => es.getProps()),
    }
  }
}
