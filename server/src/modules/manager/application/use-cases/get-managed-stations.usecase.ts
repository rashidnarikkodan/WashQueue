import { Types } from "mongoose"
import { IManagerAssignmentRepository } from "../../domain/repositories/manager-assignment.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { StationModel } from "@/modules/station/infrastructure/models/station.model"
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
          stationAddress: props.address
            ? `${props.address.street}, ${props.address.city}`
            : "",
          permissions: assignment.permissions,
          status: assignment.status,
        })
      }
    }

    // Direct fallback: check station.managerId in StationModel
    if (result.length === 0 && Types.ObjectId.isValid(managerUserId)) {
      const docs = await StationModel.find({ managerId: new Types.ObjectId(managerUserId) })
      for (const doc of docs) {
        result.push({
          stationId: doc._id.toString(),
          stationName: doc.name,
          stationAddress: doc.address ? `${doc.address.street}, ${doc.address.city}` : "",
          permissions: [
            "BOOKING_MANAGEMENT",
            "QUEUE_MANAGEMENT",
            "CUSTOMER_MANAGEMENT",
            "PRICING_MANAGEMENT",
            "REPORTS_VIEW",
            "STATION_SETTINGS",
          ],
          status: "ACTIVE",
        })
      }
    }

    return result
  }
}
