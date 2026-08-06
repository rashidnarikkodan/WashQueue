import { Types } from "mongoose"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { StationModel } from "@/modules/station/infrastructure/models/station.model"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { IGetUserBookingsUseCase } from "../interfaces/booking-usecases.interface"
import { Booking } from "../../domain/entities/Booking"

export class GetUserBookingsUseCase implements IGetUserBookingsUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly managerAssignmentRepository?: IManagerAssignmentRepository
  ) {}

  async execute(
    userId: string,
    type: "upcoming" | "history" | "all" = "all",
    role?: string
  ): Promise<BookingResponseDTO[]> {
    // If request comes from a Manager, filter bookings to the station(s) assigned to this manager
    if (role === "MANAGER") {
      let stationIds: string[] = []

      if (this.managerAssignmentRepository) {
        const assignments = await this.managerAssignmentRepository.findByUserId(userId)
        stationIds = assignments.filter((a) => a.isActive).map((a) => a.stationId)
      }

      // Direct fallback: check StationModel.managerId directly
      if (stationIds.length === 0 && Types.ObjectId.isValid(userId)) {
        const docs = await StationModel.find({ managerId: new Types.ObjectId(userId) })
        stationIds = docs.map((d) => d._id.toString())
      }

      if (stationIds.length > 0) {
        let allStationBookings: Booking[] = []
        for (const stId of stationIds) {
          const stationBookings = await this.bookingRepository.findByStationId(stId)
          allStationBookings = allStationBookings.concat(stationBookings)
        }

        // Apply type filter if upcoming/history specified
        if (type === "upcoming") {
          allStationBookings = allStationBookings.filter((b) =>
            ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_SERVICE", "IN_PROGRESS"].includes(b.status)
          )
        } else if (type === "history") {
          allStationBookings = allStationBookings.filter((b) =>
            ["SERVICE_COMPLETED", "AWAITING_HANDOVER", "COMPLETED", "CANCELLED", "NO_SHOW"].includes(b.status)
          )
        }

        return allStationBookings.map((b) => BookingDTOMapper.toDTO(b))
      }
    }

    const filter = {
      userId,
      upcomingOnly: type === "upcoming",
      historyOnly: type === "history",
    }

    const bookings = await this.bookingRepository.findByUserId(filter)

    return bookings.map((b) => BookingDTOMapper.toDTO(b))
  }
}
