import { BookingResponseDTO } from "@/modules/booking/application/dtos/booking-response.dto"

export interface IPDFInvoiceService {
  generateInvoicePdf(booking: BookingResponseDTO): Promise<Buffer>
}
