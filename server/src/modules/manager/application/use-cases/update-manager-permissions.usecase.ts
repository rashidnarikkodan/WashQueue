import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { IManagerAssignmentRepository } from "../../domain/repositories/manager-assignment.repository"
import {
  ManagerAssignment,
  ManagerPermission,
} from "../../domain/entities/ManagerAssignment"
import { IUpdateManagerPermissionsUseCase } from "../interfaces/manager-usecases.interface"

import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"

export class UpdateManagerPermissionsUseCase implements IUpdateManagerPermissionsUseCase {
  constructor(
    private readonly managerAssignmentRepository: IManagerAssignmentRepository,
    private readonly ownerRepository: IOwnerRepository
  ) {}

  async execute(
    ownerUserId: string,
    assignmentId: string,
    permissions: ManagerPermission[]
  ): Promise<ManagerAssignment> {
    const assignment = await this.managerAssignmentRepository.findById(assignmentId)
    if (!assignment) {
      throw new NotFoundError("Manager assignment not found")
    }

    const owner = await this.ownerRepository.findByUserId(ownerUserId)
    const isOwner =
      assignment.ownerId.toString() === ownerUserId.toString() ||
      (Boolean(owner?.id) && assignment.ownerId.toString() === owner!.id)

    if (!isOwner) {
      throw new ForbiddenError("You do not have permission to modify this manager assignment")
    }

    assignment.updatePermissions(permissions)
    return await this.managerAssignmentRepository.update(assignment)
  }
}
