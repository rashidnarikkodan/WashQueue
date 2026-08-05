import { ManagerAssignment } from "../entities/ManagerAssignment"

export interface FindOwnerManagersFilter {
  stationId?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface IManagerAssignmentRepository {
  create(assignment: ManagerAssignment): Promise<ManagerAssignment>
  findById(id: string): Promise<ManagerAssignment | null>
  findByUserAndStation(userId: string, stationId: string): Promise<ManagerAssignment | null>
  findByUserId(userId: string): Promise<ManagerAssignment[]>
  findByStationId(stationId: string): Promise<ManagerAssignment[]>
  findByOwnerId(
    ownerId: string,
    filters?: FindOwnerManagersFilter
  ): Promise<{ assignments: ManagerAssignment[]; total: number }>
  update(assignment: ManagerAssignment): Promise<ManagerAssignment>
  delete(id: string): Promise<boolean>
}
