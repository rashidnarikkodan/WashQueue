import { Router } from "express"
import { InvoiceController } from "../controllers/invoice.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { bookingIdParamSchema } from "@/modules/booking/presentation/schema/booking.schema"

export const createInvoiceRouter = (invoiceController: InvoiceController): Router => {
  const router = Router()

  router.use(authenticate)

  router.get(
    "/:bookingId/invoice",
    validateRequest(bookingIdParamSchema, "params"),
    asyncHandler(invoiceController.downloadInvoice)
  )

  return router
}
