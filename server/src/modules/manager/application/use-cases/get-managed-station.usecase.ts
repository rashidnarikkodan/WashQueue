import { IManagerAssignmentRepository } from "../../domain/repositories/manager-assignment.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { ManagerPermission } from "../../domain/entities/ManagerAssignment"
import {
  IGetManagedStationUseCase,
  ManagedStationResponse,
} from "../interfaces/manager-usecases.interface"

export class GetManagedStationUseCase implements IGetManagedStationUseCase {
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
          stationAddress: props.address ? `${props.address.street}, ${props.address.city}` : "",
          permissions: assignment.permissions,
          status: assignment.status,
        })
      }
    }

    if (result.length === 0) {
      const managedStations = await this.stationRepository.findByManagerId(managerUserId)
      for (const station of managedStations) {
        const props = station.getProps()
        result.push({
          stationId: station.id,
          stationName: props.name,
          stationAddress: props.address ? `${props.address.street}, ${props.address.city}` : "",
          permissions: [
            ManagerPermission.BOOKING_MANAGEMENT,
            ManagerPermission.QUEUE_MANAGEMENT,
            ManagerPermission.CUSTOMER_MANAGEMENT,
            ManagerPermission.PRICING_MANAGEMENT,
            ManagerPermission.REPORTS_VIEW,
            ManagerPermission.STATION_SETTINGS,
          ],
          status: "ACTIVE",
        })
      }
    }

    return result
  }
}
