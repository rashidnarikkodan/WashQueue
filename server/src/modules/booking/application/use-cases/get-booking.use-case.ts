import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IBookingRepository } from "../../domain/repositories/booking.repository"
import { BookingDTOMapper } from "../mappers/booking-dto.mapper"
import { BookingResponseDTO } from "../dtos/booking-response.dto"
import { IGetBookingUseCase } from "../interfaces/booking-usecases.interface"

export class GetBookingUseCase implements IGetBookingUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(bookingIdOrNumber: string, _requestingUserId?: string): Promise<BookingResponseDTO> {
    let booking = await this.bookingRepository.findById(bookingIdOrNumber)
    if (!booking) {
      booking = await this.bookingRepository.findByBookingNumber(bookingIdOrNumber)
    }

    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND)
    }

    return BookingDTOMapper.toDTO(booking)
  }
}
