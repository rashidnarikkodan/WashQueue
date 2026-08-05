import { IManagerAssignmentRepository } from "../../domain/repositories/manager-assignment.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import {
  IGetManagedStationsUseCase,
  ManagedStationResponse,
} from "../interfaces/manager-usecases.interface"

export class GetManagedStationsUseCase implements IGetManagedStationsUseCase {
  constructor(
    private readonly managerAssignmentRepository: IManagerAssignmentRepository,
    private readonly stationRepository: IStationRepository
  ) {}

  async execute(managerUserId: string): Promise<ManagedStationResponse[]> {
    const assignments = await this.managerAssignmentRepository.findByUserId(managerUserId)
    const result: ManagedStationResponse[] = []

    for (const assignment of assignments) {
      const station = await this.stationRepository.findById(assignment.stationId)
      if (station) {
        const props = station.getProps()
        result.push({
          stationId: station.id,
          stationName: props.name,
          stationAddress: props.address,
          permissions: assignment.permissions,
          status: assignment.status,
        })
      }
    }

    return result
  }
}
