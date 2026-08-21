import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ConflictError } from "@/common/errors/conflict-error"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { StationProps } from "../../domain/entities/Station"
import { IAssignManagerUseCase } from "../interfaces/station-usecases.interface"

export interface AssignManagerInput {
  managerType: "SELF" | "INVITE"
  email?: string
}

export class AssignManagerUseCase implements IAssignManagerUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly ownerRepository: IOwnerRepository
  ) {}

  async execute(
    stationId: string,
    userId: string,
    input: AssignManagerInput
  ): Promise<StationProps> {
    const owner = await this.ownerRepository.findByUserId(userId)
    if (!owner || !owner.id) {
      throw new ForbiddenError("Owner profile not found")
    }

    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    if (station.ownerId.toString() !== owner.id.toString()) {
      throw new ForbiddenError("Only the station owner can assign a manager to this station")
    }

    if (input.managerType === "SELF") {
      const existingManagedStation = await this.stationRepository.findStationManagedByOwner(
        owner.id,
        userId,
        stationId
      )

      if (existingManagedStation) {
        throw new ConflictError(
          "An owner can only directly manage one station queue. Please invite a manager for your other stations."
        )
      }

      await this.ownerRepository.updateIsManager(userId, true)

      station.assignManager(userId)
      const updatedStation = await this.stationRepository.update(station.id, { managerId: userId })

      return updatedStation ? updatedStation.getProps() : station.getProps()
    }

    return station.getProps()
  }
}
