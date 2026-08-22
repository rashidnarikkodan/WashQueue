import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { ISelfAssignManagerUseCase } from "../interfaces/manager-usecases.interface"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { IManagerAssignmentRepository } from "../../domain/repositories/manager-assignment.repository"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { AppError } from "@/common/errors/app-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ConflictError } from "@/common/errors/conflict-error"
import { StationProps } from "@/modules/station/domain/entities/Station"

export class SelfAssignManagerUseCase implements ISelfAssignManagerUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly managerAssignmentRepository: IManagerAssignmentRepository
  ) {}

  async execute(data: { stationId: string; ownerUserId: string }): Promise<StationProps> {
    const [owner, station] = await Promise.all([
      this.ownerRepository.findByUserId(data.ownerUserId),
      this.stationRepository.findById(data.stationId),
    ])

    if (!owner || !owner.id) throw new ForbiddenError("Owner profile not found")

    if (!station) throw new NotFoundError("Station not found")

    if (station.ownerId.toString() !== owner.id.toString())
      throw new ForbiddenError("Only the station owner can assign a manager to this station")

    const existingManagedStation = await this.stationRepository.findStationManagedByOwner(
      owner.id,
      data.ownerUserId,
      data.stationId
    )

    if (existingManagedStation) {
      throw new ConflictError(
        "An owner can only directly manage one station queue. Please invite a manager for your other stations."
      )
    }

    await this.ownerRepository.updateIsManager(data.ownerUserId, true)

    station.assignManager(data.ownerUserId)
    const updatedStation = await this.stationRepository.update(station.id, {
      managerId: data.ownerUserId,
    })

    return updatedStation ? updatedStation.getProps() : station.getProps()
  }
}
