import {
  FindBookingsFilter,
  IBookingRepository,
} from "../../domain/repositories/booking.repository"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { BookingListResponseDTO } from "../dtos/booking-response.dto"
import {
  GetBookingsFilterInput,
  IGetUserBookingsUseCase,
} from "../interfaces/booking-usecases.interface"
import { buildPaginationMeta } from "@/common/utils/pagination"

export class GetUserBookingsUseCase implements IGetUserBookingsUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly managerAssignmentRepository?: IManagerAssignmentRepository,
    private readonly stationRepository?: IStationRepository
  ) {}

  async execute(
    userId: string,
    filterInput?: GetBookingsFilterInput,
    role?: string,
    forceOwnScope: boolean = false
  ): Promise<BookingListResponseDTO> {
    const normRole = role ? role.toUpperCase() : ""

    const page = Math.max(1, filterInput?.page || 1)
    const limit = Math.max(1, Math.min(100, filterInput?.limit || 10))
    const type = filterInput?.type || "all"

    const upcomingOnly = type === "upcoming" || filterInput?.upcomingOnly
    const historyOnly = type === "history" || filterInput?.historyOnly
    const noShowOnly = type === "noshow" || filterInput?.noShowOnly

    const queryFilter: FindBookingsFilter = {
      ...filterInput,
      page,
      limit,
      upcomingOnly,
      historyOnly,
      noShowOnly,
    }

    // A caller asking for "my bookings" (e.g. the customer's own booking list) must always be
    // scoped strictly to their own userId, regardless of any owner/manager/admin role they also
    // hold — never fall through to the role-based station/global branches below.
    if (forceOwnScope) {
      queryFilter.userId = userId
      const result = await this.bookingRepository.findBookings(queryFilter)

      return {
        bookings: result.bookings.map((b) => BookingDTOMapper.toDTO(b)),
        pagination: buildPaginationMeta({ total: result.total, page, limit }),
      }
    }

    if (normRole === "ADMIN") {
      const result = await this.bookingRepository.findBookings(queryFilter)
      return {
        bookings: result.bookings.map((b) => BookingDTOMapper.toDTO(b)),
        pagination: buildPaginationMeta({ total: result.total, page, limit }),
      }
    }

    if (normRole === "MANAGER") {
      let stationIds: string[] = []

      if (this.managerAssignmentRepository) {
        const assignments = await this.managerAssignmentRepository.findByUserId(userId)
        stationIds = assignments.filter((a) => a.isActive).map((a) => a.stationId)
      }

      if (stationIds.length === 0 && this.stationRepository) {
        const managed = await this.stationRepository.findByManagerId(userId)
        stationIds = managed.map((s) => s.id)
      }

      if (queryFilter.stationId) {
        stationIds = stationIds.filter((id) => id === queryFilter.stationId)
      }

      queryFilter.stationIds = stationIds
      const result = await this.bookingRepository.findBookings(queryFilter)

      return {
        bookings: result.bookings.map((b) => BookingDTOMapper.toDTO(b)),
        pagination: buildPaginationMeta({ total: result.total, page, limit }),
      }
    }

    if (normRole === "OWNER") {
      let ownedStationIds: string[] = []
      if (this.stationRepository) {
        const ownedStations = await this.stationRepository.findByOwnerId(userId)
        ownedStationIds = ownedStations.map((s) => s.id)
      }

      if (queryFilter.stationId) {
        ownedStationIds = ownedStationIds.filter((id) => id === queryFilter.stationId)
      }

      queryFilter.stationIds = ownedStationIds
      const result = await this.bookingRepository.findBookings(queryFilter)

      return {
        bookings: result.bookings.map((b) => BookingDTOMapper.toDTO(b)),
        pagination: buildPaginationMeta({ total: result.total, page, limit }),
      }
    }

    queryFilter.userId = userId
    const result = await this.bookingRepository.findBookings(queryFilter)

    return {
      bookings: result.bookings.map((b) => BookingDTOMapper.toDTO(b)),
      pagination: buildPaginationMeta({ total: result.total, page, limit }),
    }
  }
}
