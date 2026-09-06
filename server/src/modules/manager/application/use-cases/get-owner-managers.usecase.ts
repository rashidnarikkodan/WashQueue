import { IManagerAssignmentRepository } from "../../domain/repositories/manager-assignment.repository"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import {
  IGetOwnerManagersUseCase,
  ListOwnerManagersInput,
  ManagerListItemResponse,
} from "../interfaces/manager-usecases.interface"

export class GetOwnerManagersUseCase implements IGetOwnerManagersUseCase {
  constructor(
    private readonly managerAssignmentRepository: IManagerAssignmentRepository,
    private readonly userRepository: IUserRepository,
    private readonly stationRepository: IStationRepository
  ) {}

  async execute(
    ownerUserId: string,
    filters?: ListOwnerManagersInput
  ): Promise<{ managers: ManagerListItemResponse[]; total: number }> {
    const { assignments, total } = await this.managerAssignmentRepository.findByOwnerId(
      ownerUserId,
      filters
    )

    const managers: ManagerListItemResponse[] = []

    for (const assignment of assignments) {
      const [user, station] = await Promise.all([
        this.userRepository.findById(assignment.managerUserId),
        this.stationRepository.findById(assignment.stationId),
      ])

      managers.push({
        managerId: assignment.id!,
        assignmentId: assignment.id!,
        managerUserId: assignment.managerUserId,
        managerName: user?.name,
        managerEmail: user?.email || "Unknown",
        managerPhone: user?.phone,
        stationId: assignment.stationId,
        stationName: station?.getProps().name || "Unknown Station",
        permissions: assignment.permissions,
        status: assignment.status,
        assignedAt: assignment.assignedAt,
      })
    }

    return { managers, total }
  }
}
