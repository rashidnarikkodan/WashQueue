import { BookingMongoRepository } from "./infrastructure/repositories/booking.mongo.repository"
import { BookingStatusLogMongoRepository } from "./infrastructure/repositories/booking-status-log.mongo.repository"
import { MongooseTransactionRunner } from "@/infrastructure/database/mongoose-transaction.runner"
import { managerAssignmentRepository } from "../manager/manager.module"

import { bookingNotificationService } from "@/modules/notification/notification.module"

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
import { CancelBookingUseCase } from "./application/use-cases/cancel-booking.use-case"
import { RescheduleBookingUseCase } from "./application/use-cases/reschedule-booking.use-case"

import { BookingController } from "./presentation/controllers/booking.controller"
import { createBookingRouter } from "./presentation/routers/booking.routes"
import { SettlementRepository } from "./infrastructure/repositories/settlement.repository"
import { CreateSettlementUseCase } from "./application/use-cases/create-settlement.use-case"
import { ProcessSettlementUseCase } from "./application/use-cases/process-settlement.use-case"
import { ownerRepository } from "../owner/owner.module"
import { RazorpayTransferService } from "@/infrastructure/payment/razorpay-transfer.service"

import type { IBookingQueueService } from "@/modules/queue/application/interfaces/booking-queue.interface"
import type { IEvaluateAndProcessRefundUseCase } from "@/modules/payment/application/interfaces/payment-usecases.interface"

export const bookingRepository = new BookingMongoRepository()
export const bookingStatusLogRepository = new BookingStatusLogMongoRepository()
const transactionRunner = new MongooseTransactionRunner()

export const createBookingUseCase = new CreateBookingUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  stationRepository,
  stationPricingRepository,
  extraServiceRepository,
  timeWindowRepository,
  vehicleRepository,
  bookingNotificationService
)

export const getBookingUseCase = new GetBookingUseCase(bookingRepository, bookingStatusLogRepository)
export const getUserBookingsUseCase = new GetUserBookingsUseCase(
  bookingRepository,
  managerAssignmentRepository,
  stationRepository
)

export const rescheduleBookingUseCase = new RescheduleBookingUseCase(
  bookingRepository,
  timeWindowRepository,
  bookingStatusLogRepository,
  bookingNotificationService,
  transactionRunner
)

export const settlementRepository = new SettlementRepository()
export const transferService = new RazorpayTransferService()
export const createSettlementUseCase = new CreateSettlementUseCase(settlementRepository)
export const processSettlementUseCase = new ProcessSettlementUseCase(
  settlementRepository,
  ownerRepository,
  transferService
)

// CreateWalkInBookingUseCase and CancelBookingUseCase depend on the queue module's Redis queue
// service (and CancelBookingUseCase optionally on the payment module's refund use-case).
// Both of those modules depend back on this module's repos, so building these two eagerly here
// would create a require() cycle between booking.module.ts and queue.module.ts/payment.module.ts.
// They're built lazily instead — see @/bootstrap/module-composition.

export function createCreateWalkInBookingUseCase(
  queueService: IBookingQueueService
): CreateWalkInBookingUseCase {
  return new CreateWalkInBookingUseCase(
    bookingRepository,
    bookingStatusLogRepository,
    stationRepository,
    stationPricingRepository,
    extraServiceRepository,
    timeWindowRepository,
    queueService,
    bookingNotificationService
  )
}

export function createCancelBookingUseCase(
  queueService: IBookingQueueService,
  refundUseCase?: IEvaluateAndProcessRefundUseCase
): CancelBookingUseCase {
  return new CancelBookingUseCase(
    bookingRepository,
    bookingStatusLogRepository,
    queueService,
    bookingNotificationService,
    refundUseCase,
    transactionRunner
  )
}

export function createBookingController(
  createWalkInBookingUseCase: CreateWalkInBookingUseCase,
  cancelBookingUseCase: CancelBookingUseCase
): BookingController {
  return new BookingController(
    createBookingUseCase,
    createWalkInBookingUseCase,
    getBookingUseCase,
    getUserBookingsUseCase,
    cancelBookingUseCase,
    rescheduleBookingUseCase
  )
}

export { createBookingRouter }
