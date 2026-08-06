import { Types } from "mongoose"
import { StationModel } from "@/modules/station/infrastructure/models/station.model"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ROLE } from "@/common/constants/role.constants"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IManagerAssignmentRepository } from "../../domain/repositories/manager-assignment.repository"
import { IRemoveManagerUseCase } from "../interfaces/manager-usecases.interface"

import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"

export class RemoveManagerUseCase implements IRemoveManagerUseCase {
  constructor(
    private readonly managerAssignmentRepository: IManagerAssignmentRepository,
    private readonly userRepository: IUserRepository,
    private readonly ownerRepository: IOwnerRepository
  ) {}

  async execute(ownerUserId: string, assignmentId: string): Promise<void> {
    const assignment = await this.managerAssignmentRepository.findById(assignmentId)
    if (!assignment) {
      throw new NotFoundError("Manager assignment not found")
    }

    const owner = await this.ownerRepository.findByUserId(ownerUserId)
    const isOwner =
      assignment.ownerId.toString() === ownerUserId.toString() ||
      (Boolean(owner?.id) && assignment.ownerId.toString() === owner!.id)

    if (!isOwner) {
      throw new ForbiddenError("You do not have permission to remove this manager assignment")
    }

    const managerUserId = assignment.managerUserId
    await this.managerAssignmentRepository.delete(assignmentId)

    // Unset managerId on Station document
    if (Types.ObjectId.isValid(assignment.stationId)) {
      await StationModel.findByIdAndUpdate(assignment.stationId, {
        $unset: { managerId: 1 },
      })
    }

    // Check if the user has any other active manager assignments
    const remainingAssignments = await this.managerAssignmentRepository.findByUserId(managerUserId)
    if (remainingAssignments.length === 0) {
      const user = await this.userRepository.findById(managerUserId)
      if (user && user.role === ROLE.MANAGER) {
        await this.userRepository.updateRole(managerUserId, ROLE.CUSTOMER)
      }
    }
  }
}
