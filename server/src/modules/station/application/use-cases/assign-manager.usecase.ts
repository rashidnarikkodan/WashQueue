import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ConflictError } from "@/common/errors/conflict-error"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { StationProps } from "../../domain/entities/Station"
import { Owner } from "@/modules/owner/infrastructure/model/owner.model"
import { Types } from "mongoose"
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

  async execute(stationId: string, userId: string, input: AssignManagerInput): Promise<StationProps> {
    const owner = await this.ownerRepository.findByUserId(userId)
    if (!owner || !owner.id) {
      throw new ForbiddenError("Owner profile not found")
    }

    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    // Check ownership using owner.id (owner._id)
    if (station.ownerId.toString() !== owner.id.toString()) {
      throw new ForbiddenError("Only the station owner can assign a manager to this station")
    }

    if (input.managerType === "SELF") {
      // Check Rule 2: An owner can only directly manage ONE station queue
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

      // Update Owner model: isManager = true
      await Owner.updateOne(
        { userId: new Types.ObjectId(userId) },
        { $set: { isManager: true } }
      ).exec()

      // Assign manager to station via domain entity & repository
      station.assignManager(userId)
      await this.stationRepository.update(station.id, { managerId: userId })
    } else if (input.managerType === "INVITE") {
      // Handle manager invitation workflow
      if (input.email) {
        // If email provided, we can set up invitation or placeholder
        await Owner.updateOne(
          { userId: new Types.ObjectId(userId) },
          { $set: { isManager: true } }
        ).exec()
      }
    }

    const updatedStation = await this.stationRepository.findById(stationId)
    if (!updatedStation) {
      throw new NotFoundError("Station not found after update")
    }

    return updatedStation.getProps()
  }
}
