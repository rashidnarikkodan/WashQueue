import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { IGetUserBookingsUseCase } from "../interfaces/booking-usecases.interface"

export class GetUserBookingsUseCase implements IGetUserBookingsUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(userId: string, type: "upcoming" | "history" | "all" = "all"): Promise<BookingResponseDTO[]> {
    const filter = {
      userId,
      upcomingOnly: type === "upcoming",
      historyOnly: type === "history",
    }

    const bookings = await this.bookingRepository.findByUserId(filter)

    return bookings.map((b) => BookingDTOMapper.toDTO(b))
  }
}
