import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { IGetUserBookingsUseCase } from "../interfaces/booking-usecases.interface"
import { Booking } from "../../domain/entities/Booking"

export class GetUserBookingsUseCase implements IGetUserBookingsUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly managerAssignmentRepository?: IManagerAssignmentRepository,
    private readonly stationRepository?: IStationRepository
  ) {}

  async execute(
    userId: string,
    type: "upcoming" | "history" | "all" = "all",
    role?: string
  ): Promise<BookingResponseDTO[]> {
    const normRole = role ? role.toUpperCase() : ""

    // 1. Manager Role: Return bookings for stations assigned to this manager
    if (normRole === "MANAGER") {
      let stationIds: string[] = []

      if (this.managerAssignmentRepository) {
        const assignments = await this.managerAssignmentRepository.findByUserId(userId)
        stationIds = assignments.filter((a) => a.isActive).map((a) => a.stationId)
      }

      // Fallback via station repository interface
      if (stationIds.length === 0 && this.stationRepository) {
        const managed = await this.stationRepository.findByManagerId(userId)
        stationIds = managed.map((s) => s.id)
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
            [
              "SERVICE_COMPLETED",
              "AWAITING_HANDOVER",
              "COMPLETED",
              "CANCELLED",
              "NO_SHOW",
            ].includes(b.status)
          )
        }

        return allStationBookings.map((b) => BookingDTOMapper.toDTO(b))
      }
    }

    // 2. Owner Role: Return bookings for all stations owned by this owner
    if (normRole === "OWNER" && this.stationRepository) {
      const ownedStations = await this.stationRepository.findByOwnerId(userId)
      const stationIds = ownedStations.map((s) => s.id)

      if (stationIds.length > 0) {
        let allOwnerBookings: Booking[] = []
        for (const stId of stationIds) {
          const stationBookings = await this.bookingRepository.findByStationId(stId)
          allOwnerBookings = allOwnerBookings.concat(stationBookings)
        }

        // Also include bookings created directly by this user
        const userFilter = {
          userId,
          upcomingOnly: type === "upcoming",
          historyOnly: type === "history",
        }
        const userOwnBookings = await this.bookingRepository.findByUserId(userFilter)

        const combinedMap = new Map<string, Booking>()
        allOwnerBookings.forEach((b) => combinedMap.set(b.id, b))
        userOwnBookings.forEach((b) => combinedMap.set(b.id, b))

        let combined = Array.from(combinedMap.values())

        if (type === "upcoming") {
          combined = combined.filter((b) =>
            ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_SERVICE", "IN_PROGRESS"].includes(b.status)
          )
        } else if (type === "history") {
          combined = combined.filter((b) =>
            [
              "SERVICE_COMPLETED",
              "AWAITING_HANDOVER",
              "COMPLETED",
              "CANCELLED",
              "NO_SHOW",
            ].includes(b.status)
          )
        }

        return combined.map((b) => BookingDTOMapper.toDTO(b))
      }
    }

    // 3. Default (Customer / User Role): Return bookings by userId
    const filter = {
      userId,
      upcomingOnly: type === "upcoming",
      historyOnly: type === "history",
    }

    const bookings = await this.bookingRepository.findByUserId(filter)
    return bookings.map((b) => BookingDTOMapper.toDTO(b))
  }
}
