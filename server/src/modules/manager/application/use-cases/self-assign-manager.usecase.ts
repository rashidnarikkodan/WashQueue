import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { ISelfAssignManagerUseCase } from "../interfaces/manager-usecases.interface"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { IManagerAssignmentRepository } from "../../domain/repositories/manager-assignment.repository"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ConflictError } from "@/common/errors/conflict-error"
import { StationProps } from "@/modules/station/domain/entities/Station"
import { ManagerAssignment, ManagerAssignmentStatus, ManagerPermission } from "../../domain/entities/ManagerAssignment"

const ALL_MANAGER_PERMISSIONS = Object.values(ManagerPermission)

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

    const existingAssignment = await this.managerAssignmentRepository.findByUserAndStation(
      data.ownerUserId,
      data.stationId
    )

    if (existingAssignment) {
      existingAssignment.reactivate()
      existingAssignment.updatePermissions(ALL_MANAGER_PERMISSIONS)
      await this.managerAssignmentRepository.update(existingAssignment)
    } else {
      await this.managerAssignmentRepository.create(
        new ManagerAssignment({
          managerUserId: data.ownerUserId,
          stationId: data.stationId,
          ownerId: data.ownerUserId,
          permissions: ALL_MANAGER_PERMISSIONS,
          status: ManagerAssignmentStatus.ACTIVE,
          assignedAt: new Date(),
        })
      )
    }

    await this.stationRepository.setManagerId(data.stationId, data.ownerUserId)

    const updatedStation = await this.stationRepository.findById(data.stationId)
    return updatedStation ? updatedStation.getProps() : station.getProps()
  }
}
