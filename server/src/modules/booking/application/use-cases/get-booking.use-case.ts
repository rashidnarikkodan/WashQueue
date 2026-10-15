import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { IGetBookingUseCase } from "../interfaces/booking-usecases.interface"

export class GetBookingUseCase implements IGetBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly bookingStatusLogRepository?: IBookingStatusLogRepository
  ) {}

  async execute(
    bookingIdOrNumber: string,
    requestingUserId?: string,
    requestingRole?: string
  ): Promise<BookingResponseDTO> {
    let booking = await this.bookingRepository.findById(bookingIdOrNumber)
    if (!booking) {
      booking = await this.bookingRepository.findByBookingNumber(bookingIdOrNumber)
    }

    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    const normRole = (requestingRole || "").toUpperCase()
    if (requestingUserId && normRole !== "ADMIN") {
      const isStaff = normRole === "MANAGER" || normRole === "OWNER"
      if (!isStaff && booking.userId && booking.userId !== requestingUserId) {
        throw new AppError("You are not authorized to view this booking", HTTP_STATUS.FORBIDDEN)
      }
    }

    let statusLogs
    if (this.bookingStatusLogRepository) {
      statusLogs = await this.bookingStatusLogRepository.findByBookingId(booking.id)
    }

    return BookingDTOMapper.toDTO(booking, undefined, statusLogs)
  }
}
