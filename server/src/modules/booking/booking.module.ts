import { BookingMongoRepository } from "./infrastructure/repositories/booking.mongo.repository"
import { BookingStatusLogMongoRepository } from "./infrastructure/repositories/booking-status-log.mongo.repository"
import { BookingRedisQueueService } from "./infrastructure/services/booking-redis-queue.service"
import { BookingNotificationService } from "./infrastructure/services/booking-notification.service"
import { PDFInvoiceService } from "./infrastructure/services/pdf-invoice.service"

import {
  stationRepository,
  stationPricingRepository,
  extraServiceRepository,
  timeWindowRepository,
} from "../station/station.module"
import { vehicleRepository } from "../vehicle/vehicle.module"

import { CreateBookingUseCase } from "./application/use-cases/create-booking.use-case"
import { CreateWalkInBookingUseCase } from "./application/use-cases/create-walkin-booking.use-case"
import { GetBookingUseCase } from "./application/use-cases/get-booking.use-case"
import { GetUserBookingsUseCase } from "./application/use-cases/get-user-bookings.use-case"
import { CheckInBookingUseCase } from "./application/use-cases/check-in-booking.use-case"
import { AdvanceBookingStatusUseCase } from "./application/use-cases/advance-booking-status.use-case"
import { CancelBookingUseCase } from "./application/use-cases/cancel-booking.use-case"

import { BookingController } from "./presentation/booking.controller"
import { createBookingRouter } from "./presentation/booking.routes"

import { MongoManagerAssignmentRepository } from "../manager/infrastructure/repositories/manager-assignment.mongo.repository"

import { BookingReservationMongoRepository } from "./infrastructure/repositories/booking-reservation.mongo.repository"
import { CreateBookingReservationUseCase } from "./application/use-cases/create-booking-reservation.use-case"
import { ConfirmBookingReservationUseCase } from "./application/use-cases/confirm-booking-reservation.use-case"
import { CancelBookingReservationUseCase } from "./application/use-cases/cancel-booking-reservation.use-case"
import { ProcessRazorpayWebhookUseCase } from "./application/use-cases/process-razorpay-webhook.use-case"
import { CleanupExpiredReservationsUseCase } from "./application/use-cases/cleanup-expired-reservations.use-case"
import { creditWalletUseCase } from "../wallet/wallet.module"

// Instantiate repositories & services
export const bookingRepository = new BookingMongoRepository()
export const bookingStatusLogRepository = new BookingStatusLogMongoRepository()
export const bookingReservationRepository = new BookingReservationMongoRepository()
const managerAssignmentRepository = new MongoManagerAssignmentRepository()

const bookingRedisQueueService = new BookingRedisQueueService()
const bookingNotificationService = new BookingNotificationService()

export const createBookingReservationUseCase = new CreateBookingReservationUseCase(
  stationRepository,
  stationPricingRepository,
  extraServiceRepository,
  timeWindowRepository,
  vehicleRepository,
  bookingReservationRepository
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
  bookingNotificationService
)

export const cancelBookingReservationUseCase = new CancelBookingReservationUseCase(
  bookingReservationRepository,
  timeWindowRepository
)

export const processRazorpayWebhookUseCase = new ProcessRazorpayWebhookUseCase(
  bookingReservationRepository,
  confirmBookingReservationUseCase
)

export const cleanupExpiredReservationsUseCase = new CleanupExpiredReservationsUseCase(
  bookingReservationRepository,
  timeWindowRepository
)

// Instantiate use cases
const createBookingUseCase = new CreateBookingUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  stationRepository,
  stationPricingRepository,
  extraServiceRepository,
  timeWindowRepository,
  vehicleRepository,
  bookingNotificationService
)

const createWalkInBookingUseCase = new CreateWalkInBookingUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  stationRepository,
  stationPricingRepository,
  extraServiceRepository,
  timeWindowRepository,
  bookingRedisQueueService,
  bookingNotificationService
)

const getBookingUseCase = new GetBookingUseCase(bookingRepository, bookingStatusLogRepository)
const getUserBookingsUseCase = new GetUserBookingsUseCase(
  bookingRepository,
  managerAssignmentRepository,
  stationRepository
)

const checkInBookingUseCase = new CheckInBookingUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  bookingRedisQueueService,
  bookingNotificationService
)

const advanceBookingStatusUseCase = new AdvanceBookingStatusUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  bookingRedisQueueService,
  bookingNotificationService
)

import { refundWalletUseCase } from "@/modules/wallet/wallet.module"
import { EvaluateAndProcessRefundUseCase } from "./application/use-cases/evaluate-and-process-refund.use-case"

export const evaluateAndProcessRefundUseCase = new EvaluateAndProcessRefundUseCase(
  bookingRepository,
  creditWalletUseCase,
  bookingNotificationService,
  refundWalletUseCase
)

const cancelBookingUseCase = new CancelBookingUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  bookingRedisQueueService,
  bookingNotificationService,
  creditWalletUseCase,
  evaluateAndProcessRefundUseCase
)

import { ValidateQRForCheckInUseCase } from "./application/use-cases/validate-qr.use-case"
import { SavePreInspectionAndCheckInUseCase } from "./application/use-cases/save-pre-inspection.use-case"
import { GetOperationalQueueUseCase } from "./application/use-cases/get-operational-queue.use-case"
import { StartServiceUseCase } from "./application/use-cases/start-service.use-case"

const validateQRUseCase = new ValidateQRForCheckInUseCase(
  bookingRepository,
  managerAssignmentRepository,
  stationRepository
)

const savePreInspectionUseCase = new SavePreInspectionAndCheckInUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  bookingRedisQueueService,
  bookingNotificationService
)

export const getOperationalQueueUseCase = new GetOperationalQueueUseCase(
  bookingRedisQueueService,
  stationRepository
)

import { ProcessNoShowBookingsUseCase } from "./application/use-cases/process-no-show-bookings.use-case"

export const processNoShowBookingsUseCase = new ProcessNoShowBookingsUseCase(
  bookingStatusLogRepository,
  bookingRedisQueueService,
  bookingNotificationService,
  evaluateAndProcessRefundUseCase
)

const startServiceUseCase = new StartServiceUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  stationRepository,
  managerAssignmentRepository,
  bookingRedisQueueService,
  bookingNotificationService
)

import { SavePostInspectionUseCase } from "./application/use-cases/save-post-inspection.use-case"
import { CompleteHandoverUseCase } from "./application/use-cases/complete-handover.use-case"

const savePostInspectionUseCase = new SavePostInspectionUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  stationRepository,
  managerAssignmentRepository,
  bookingRedisQueueService,
  bookingNotificationService
)

const completeHandoverUseCase = new CompleteHandoverUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  stationRepository,
  managerAssignmentRepository,
  bookingRedisQueueService,
  bookingNotificationService
)

import { StallBookingUseCase } from "./application/use-cases/stall-booking.use-case"
import { ResolveStalledBookingUseCase } from "./application/use-cases/resolve-stalled-booking.use-case"

export const stallBookingUseCase = new StallBookingUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  bookingRedisQueueService,
  bookingNotificationService
)

export const resolveStalledBookingUseCase = new ResolveStalledBookingUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  bookingRedisQueueService,
  bookingNotificationService,
  evaluateAndProcessRefundUseCase
)

const pdfInvoiceService = new PDFInvoiceService()

// Instantiate controller
const bookingController = new BookingController(
  createBookingUseCase,
  createWalkInBookingUseCase,
  getBookingUseCase,
  getUserBookingsUseCase,
  checkInBookingUseCase,
  advanceBookingStatusUseCase,
  cancelBookingUseCase,
  pdfInvoiceService,
  validateQRUseCase,
  savePreInspectionUseCase,
  getOperationalQueueUseCase,
  startServiceUseCase,
  savePostInspectionUseCase,
  completeHandoverUseCase,
  stallBookingUseCase,
  resolveStalledBookingUseCase
)

import { PaymentController } from "./presentation/payment.controller"
import { createPaymentRouter } from "./presentation/payment.routes"

const paymentController = new PaymentController(
  createBookingReservationUseCase,
  confirmBookingReservationUseCase,
  cancelBookingReservationUseCase,
  processRazorpayWebhookUseCase,
  cleanupExpiredReservationsUseCase
)

export const paymentRouter = createPaymentRouter(paymentController)

// Create router
const bookingRouter = createBookingRouter(bookingController)

export { bookingRouter }
export default bookingRouter
