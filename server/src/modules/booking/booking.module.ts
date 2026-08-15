import { BookingMongoRepository } from "./infrastructure/repositories/booking.mongo.repository"
import { BookingStatusLogMongoRepository } from "./infrastructure/repositories/booking-status-log.mongo.repository"
import { BookingReservationMongoRepository } from "./infrastructure/repositories/booking-reservation.mongo.repository"
import { MongoManagerAssignmentRepository } from "../manager/infrastructure/repositories/manager-assignment.mongo.repository"

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
import { creditWalletUseCase, refundWalletUseCase } from "../wallet/wallet.module"

// Use cases
import { CreateBookingReservationUseCase } from "./application/use-cases/create-booking-reservation.use-case"
import { ConfirmBookingReservationUseCase } from "./application/use-cases/confirm-booking-reservation.use-case"
import { CancelBookingReservationUseCase } from "./application/use-cases/cancel-booking-reservation.use-case"
import { ProcessRazorpayWebhookUseCase } from "./application/use-cases/process-razorpay-webhook.use-case"
import { CleanupExpiredReservationsUseCase } from "./application/use-cases/cleanup-expired-reservations.use-case"
import { EvaluateAndProcessRefundUseCase } from "./application/use-cases/evaluate-and-process-refund.use-case"
import { CreateBookingUseCase } from "./application/use-cases/create-booking.use-case"
import { CreateWalkInBookingUseCase } from "./application/use-cases/create-walkin-booking.use-case"
import { GetBookingUseCase } from "./application/use-cases/get-booking.use-case"
import { GetUserBookingsUseCase } from "./application/use-cases/get-user-bookings.use-case"
import { CheckInBookingUseCase } from "./application/use-cases/check-in-booking.use-case"
import { CancelBookingUseCase } from "./application/use-cases/cancel-booking.use-case"
import { ValidateQRForCheckInUseCase } from "./application/use-cases/validate-qr.use-case"
import { SavePreInspectionAndCheckInUseCase } from "./application/use-cases/save-pre-inspection.use-case"
import { GetOperationalQueueUseCase } from "./application/use-cases/get-operational-queue.use-case"
import { ProcessNoShowBookingsUseCase } from "./application/use-cases/process-no-show-bookings.use-case"
import { StartServiceUseCase } from "./application/use-cases/start-service.use-case"
import { SavePostInspectionUseCase } from "./application/use-cases/save-post-inspection.use-case"
import { CompleteHandoverUseCase } from "./application/use-cases/complete-handover.use-case"
import { StallBookingUseCase } from "./application/use-cases/stall-booking.use-case"
import { ResolveStalledBookingUseCase } from "./application/use-cases/resolve-stalled-booking.use-case"

// Presentation
import { BookingController } from "./presentation/booking.controller"
import { createBookingRouter } from "./presentation/booking.routes"
import { PaymentController } from "./presentation/payment.controller"
import { createPaymentRouter } from "./presentation/payment.routes"

// Instantiate Repositories
export const bookingRepository = new BookingMongoRepository()
export const bookingStatusLogRepository = new BookingStatusLogMongoRepository()
export const bookingReservationRepository = new BookingReservationMongoRepository()
const managerAssignmentRepository = new MongoManagerAssignmentRepository()

// Instantiate Services
const bookingRedisQueueService = new BookingRedisQueueService()
const bookingNotificationService = new BookingNotificationService()
const pdfInvoiceService = new PDFInvoiceService()

// Payment & Reservation Use Cases
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

// Refund & Booking Lifecycle Use Cases
export const evaluateAndProcessRefundUseCase = new EvaluateAndProcessRefundUseCase(
  bookingRepository,
  creditWalletUseCase,
  bookingNotificationService,
  refundWalletUseCase
)

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

const cancelBookingUseCase = new CancelBookingUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  bookingRedisQueueService,
  bookingNotificationService,
  creditWalletUseCase,
  evaluateAndProcessRefundUseCase
)

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

// Presentation Composition
const bookingController = new BookingController(
  createBookingUseCase,
  createWalkInBookingUseCase,
  getBookingUseCase,
  getUserBookingsUseCase,
  checkInBookingUseCase,
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

const paymentController = new PaymentController(
  createBookingReservationUseCase,
  confirmBookingReservationUseCase,
  cancelBookingReservationUseCase,
  processRazorpayWebhookUseCase
)

export const bookingRouter = createBookingRouter(bookingController)
export const paymentRouter = createPaymentRouter(paymentController)

export default bookingRouter
