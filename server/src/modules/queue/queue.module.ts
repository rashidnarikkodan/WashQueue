import {
  bookingRepository,
  bookingStatusLogRepository,
  createSettlementUseCase,
  processSettlementUseCase,
} from "@/modules/booking/booking.module"
import { managerAssignmentRepository } from "@/modules/manager/manager.module"
import { stationRepository } from "@/modules/station/station.module"
import { bookingNotificationService } from "@/modules/notification/notification.module"
import { evaluateAndProcessRefundUseCase } from "@/modules/payment/payment.module"

import { BookingRedisQueueService } from "./infrastructure/services/queue-redis.service"

import { ValidateQRForCheckInUseCase } from "./application/use-cases/validate-qr.use-case"
import { SavePreInspectionAndCheckInUseCase } from "./application/use-cases/save-pre-inspection.use-case"
import { GetOperationalQueueUseCase } from "./application/use-cases/get-operational-queue.use-case"
import { GetPublicStationQueueUseCase } from "./application/use-cases/get-public-station-queue.use-case"
import { StartServiceUseCase } from "./application/use-cases/start-service.use-case"
import { SavePostInspectionUseCase } from "./application/use-cases/save-post-inspection.use-case"
import { CompleteHandoverUseCase } from "./application/use-cases/complete-handover.use-case"
import { StallBookingUseCase } from "./application/use-cases/stall-booking.use-case"
import { ResolveStalledBookingUseCase } from "./application/use-cases/resolve-stalled-booking.use-case"
import { ProcessNoShowBookingsUseCase } from "./application/use-cases/process-no-show-bookings.use-case"

import { QueueController } from "./presentation/controllers/queue.controller"
import { createQueueRouter } from "./presentation/routers/queue.routes"

export const bookingRedisQueueService = new BookingRedisQueueService(
  bookingStatusLogRepository,
  stationRepository
)

const validateQRUseCase = new ValidateQRForCheckInUseCase(
  bookingRepository,
  managerAssignmentRepository,
  stationRepository,
  bookingStatusLogRepository,
  bookingNotificationService
)

const savePreInspectionUseCase = new SavePreInspectionAndCheckInUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  bookingRedisQueueService,
  bookingNotificationService,
  stationRepository,
  managerAssignmentRepository
)

export const getOperationalQueueUseCase = new GetOperationalQueueUseCase(
  bookingRedisQueueService,
  stationRepository,
  managerAssignmentRepository
)

export const getPublicStationQueueUseCase = new GetPublicStationQueueUseCase(
  bookingRedisQueueService,
  stationRepository
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
  bookingNotificationService,
  createSettlementUseCase,
  processSettlementUseCase
)

const completeHandoverUseCase = new CompleteHandoverUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  stationRepository,
  managerAssignmentRepository,
  bookingRedisQueueService,
  bookingNotificationService,
  createSettlementUseCase,
  processSettlementUseCase
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

export const processNoShowBookingsUseCase = new ProcessNoShowBookingsUseCase(
  bookingRepository,
  bookingStatusLogRepository,
  bookingRedisQueueService,
  bookingNotificationService
)

const queueController = new QueueController(
  validateQRUseCase,
  savePreInspectionUseCase,
  getOperationalQueueUseCase,
  startServiceUseCase,
  savePostInspectionUseCase,
  completeHandoverUseCase,
  stallBookingUseCase,
  resolveStalledBookingUseCase,
  getPublicStationQueueUseCase
)

export const queueRouter = createQueueRouter(queueController)

export default queueRouter
