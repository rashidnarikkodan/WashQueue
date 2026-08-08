import { BookingResponseDTO } from "../dtos/booking-response.dto"

export interface IPDFInvoiceService {
  generateInvoicePdf(booking: BookingResponseDTO): Promise<Buffer>
}
