import { BookingReservationMongoRepository } from "./infrastructure/repositories/booking-reservation.mongo.repository"
import { MongooseTransactionRunner } from "@/infrastructure/database/mongoose-transaction.runner"
import { sharedRazorpayService } from "@/infrastructure/payment/razorpay.service"
import { bookingNotificationService } from "@/modules/notification/notification.module"
import {
  bookingRepository,
  bookingStatusLogRepository,
  getBookingUseCase,
} from "@/modules/booking/booking.module"

import {
  stationRepository,
  stationPricingRepository,
  extraServiceRepository,
  timeWindowRepository,
} from "@/modules/station/station.module"
import { vehicleRepository } from "@/modules/vehicle/vehicle.module"
import {
  vehicleCategoryRepository,
  vehicleClassRepository,
} from "@/modules/vehicle-catelog/vehicle.module"
import {
  creditWalletUseCase,
  refundWalletUseCase,
  walletRepository,
  debitWalletUseCase,
} from "@/modules/wallet/wallet.module"

import { CreateBookingReservationUseCase } from "./application/use-cases/create-booking-reservation.use-case"
import { ConfirmBookingReservationUseCase } from "./application/use-cases/confirm-booking-reservation.use-case"
import { CancelBookingReservationUseCase } from "./application/use-cases/cancel-booking-reservation.use-case"
import { ProcessRazorpayWebhookUseCase } from "./application/use-cases/process-razorpay-webhook.use-case"
import { CleanupExpiredReservationsUseCase } from "./application/use-cases/cleanup-expired-reservations.use-case"
import { EvaluateAndProcessRefundUseCase } from "./application/use-cases/evaluate-and-process-refund.use-case"

import { PDFInvoiceService } from "./infrastructure/services/pdf-invoice.service"

import { PaymentController } from "./presentation/controllers/payment.controller"
import { createPaymentRouter } from "./presentation/routers/payment.routes"
import { InvoiceController } from "./presentation/controllers/invoice.controller"
import { createInvoiceRouter } from "./presentation/routers/invoice.routes"

export const bookingReservationRepository = new BookingReservationMongoRepository()
const transactionRunner = new MongooseTransactionRunner()
export const pdfInvoiceService = new PDFInvoiceService(
  vehicleCategoryRepository,
  vehicleClassRepository
)

export const createBookingReservationUseCase = new CreateBookingReservationUseCase(
  stationRepository,
  stationPricingRepository,
  extraServiceRepository,
  timeWindowRepository,
  vehicleRepository,
  bookingReservationRepository,
  sharedRazorpayService,
  walletRepository
)

export const confirmBookingReservationUseCase = new ConfirmBookingReservationUseCase(
  bookingReservationRepository,
  bookingRepository,
  bookingStatusLogRepository,
  stationRepository,
  stationPricingRepository,
  extraServiceRepository,
  timeWindowRepository,
  vehicleRepository,
  bookingNotificationService,
  sharedRazorpayService,
  debitWalletUseCase,
  transactionRunner
)

export const cancelBookingReservationUseCase = new CancelBookingReservationUseCase(
  bookingReservationRepository,
  timeWindowRepository
)

export const processRazorpayWebhookUseCase = new ProcessRazorpayWebhookUseCase(
  bookingReservationRepository,
  confirmBookingReservationUseCase,
  sharedRazorpayService
)

export const cleanupExpiredReservationsUseCase = new CleanupExpiredReservationsUseCase(
  bookingReservationRepository,
  timeWindowRepository
)

export const evaluateAndProcessRefundUseCase = new EvaluateAndProcessRefundUseCase(
  bookingRepository,
  creditWalletUseCase,
  bookingNotificationService,
  refundWalletUseCase
)

const paymentController = new PaymentController(
  createBookingReservationUseCase,
  confirmBookingReservationUseCase,
  cancelBookingReservationUseCase,
  processRazorpayWebhookUseCase
)

const invoiceController = new InvoiceController(getBookingUseCase, pdfInvoiceService)

export const paymentRouter = createPaymentRouter(paymentController)
export const invoiceRouter = createInvoiceRouter(invoiceController)

export default paymentRouter
