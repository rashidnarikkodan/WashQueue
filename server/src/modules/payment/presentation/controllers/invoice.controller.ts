import { Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IGetBookingUseCase } from "@/modules/booking/application/interfaces/booking-usecases.interface"
import { IPDFInvoiceService } from "../../application/interfaces/pdf-invoice.interface"

export class InvoiceController {
  constructor(
    private readonly getBookingUseCase: IGetBookingUseCase,
    private readonly pdfInvoiceService: IPDFInvoiceService
  ) {}

  downloadInvoice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { bookingId } = req.params as { bookingId: string }
    const booking = await this.getBookingUseCase.execute(bookingId, req.user?.userId)
    const pdfBuffer = await this.pdfInvoiceService.generateInvoicePdf(booking)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${booking.bookingNumber}.pdf`
    )
    res.setHeader("Content-Length", pdfBuffer.length)
    res.status(HTTP_STATUS.OK).send(pdfBuffer)
  }
}
