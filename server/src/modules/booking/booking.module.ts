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

// Instantiate repositories & services
export const bookingRepository = new BookingMongoRepository()
export const bookingStatusLogRepository = new BookingStatusLogMongoRepository()
const managerAssignmentRepository = new MongoManagerAssignmentRepository()

const bookingRedisQueueService = new BookingRedisQueueService()
const bookingNotificationService = new BookingNotificationService()

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
  bookingNotificationService
)

const getBookingUseCase = new GetBookingUseCase(bookingRepository)
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

const cancelBookingUseCase = new CancelBookingUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  bookingRedisQueueService,
  bookingNotificationService
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
  pdfInvoiceService
)

// Create router
const bookingRouter = createBookingRouter(bookingController)

export default bookingRouter
