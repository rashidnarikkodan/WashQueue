import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { IStationPricingRepository } from "../../domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "../../domain/repositories/extra-service.repository"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { StationDetailResponseDto } from "../dtos/get-station.dto"
import { IGetStationUseCase } from "../interfaces/station-usecases.interface"

export class GetStationUseCase implements IGetStationUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository,
    private readonly ownerRepository: IOwnerRepository
  ) {}

  async execute(stationId: string, userId: string): Promise<StationDetailResponseDto> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    // Look up the owner by userId so we compare owner.id with station.ownerId correctly
    const owner = await this.ownerRepository.findByUserId(userId)
    if (!owner || station.ownerId !== owner.id) {
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
