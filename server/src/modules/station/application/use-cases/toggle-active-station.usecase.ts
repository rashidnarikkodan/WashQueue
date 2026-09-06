import { AppError } from "@/common/errors/app-error"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { Station, StationStatus } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { IToggleActiveStationUseCase } from "../interfaces/station-usecases.interface"

export class ToggleActiveStationUseCase implements IToggleActiveStationUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly ownerRepository: IOwnerRepository
  ) {}

  async execute(stationId: string, userId: string): Promise<Station> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    const owner = await this.ownerRepository.findByUserId(userId)
    if (!owner || station.ownerId !== owner.id) {
      throw new ForbiddenError("You are not authorized to update this station")
    }

    if (!owner.isVerified) {
      throw new ForbiddenError("Your owner account is pending approval by an administrator.")
    }

    if (station.status !== StationStatus.ACTIVE && station.status !== StationStatus.INACTIVE) {
      throw new AppError(
        "Only approved (active or inactive) stations can be toggled",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    if (station.status === StationStatus.ACTIVE) {
      station.updateStatus(StationStatus.INACTIVE)
    } else {
      station.updateStatus(StationStatus.ACTIVE)
    }

    return this.stationRepository.save(station)
  }
}
