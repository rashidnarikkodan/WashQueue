import {
  razorpayXPayoutProvider,
  verifyRazorpayXWebhookSignature,
} from "@/infrastructure/payment/razorpayx-payout.service"
import { ownerRepository } from "../owner/owner.module"
import { bookingRepository } from "../booking/booking.module"
import { notificationDispatcherService } from "../notification/notification.module"
import { SettlementRepository } from "./infrastructure/repositories/settlement.mongo.repository"
import { PayoutRepository } from "./infrastructure/repositories/payout.mongo.repository"
import { CreateSettlementUseCase } from "./application/use-cases/create-settlement.use-case"
import { ProcessSettlementUseCase } from "./application/use-cases/process-settlement.use-case"
import { GetOwnerSettlementSummaryUseCase } from "./application/use-cases/get-owner-settlement-summary.use-case"
import { GetOwnerSettlementsUseCase } from "./application/use-cases/get-owner-settlements.use-case"
import { GetOwnerEarningsHistoryUseCase } from "./application/use-cases/get-owner-earnings-history.use-case"
import { GetAdminSettlementsUseCase } from "./application/use-cases/get-admin-settlements.use-case"
import { GetAdminSettlementMetricsUseCase } from "./application/use-cases/get-admin-settlement-metrics.use-case"
import { GetSettlementByIdUseCase } from "./application/use-cases/get-settlement-by-id.use-case"
import { RetrySettlementUseCase } from "./application/use-cases/retry-settlement.use-case"
import { ManageSettlementHoldUseCase } from "./application/use-cases/manage-settlement-hold.use-case"
import { ProcessPendingSettlementsUseCase } from "./application/use-cases/process-pending-settlements.use-case"
import { HandlePayoutWebhookUseCase } from "./application/use-cases/handle-payout-webhook.use-case"
import { SettlementController } from "./presentation/controllers/settlement.controller"
import { PayoutWebhookController } from "./presentation/controllers/payout-webhook.controller"
import { createSettlementRouter } from "./presentation/routers/settlement.routes"

// Repositories
export const settlementRepository = new SettlementRepository()
export const payoutRepository = new PayoutRepository()

// Use Cases
export const createSettlementUseCase = new CreateSettlementUseCase(settlementRepository)
export const processSettlementUseCase = new ProcessSettlementUseCase(
  settlementRepository,
  payoutRepository,
  ownerRepository,
  razorpayXPayoutProvider,
  bookingRepository,
  notificationDispatcherService
)

export const getOwnerSettlementSummaryUseCase = new GetOwnerSettlementSummaryUseCase(
  settlementRepository,
  ownerRepository
)
export const getOwnerSettlementsUseCase = new GetOwnerSettlementsUseCase(
  settlementRepository,
  ownerRepository,
  bookingRepository
)
export const getOwnerEarningsHistoryUseCase = new GetOwnerEarningsHistoryUseCase(
  ownerRepository,
  bookingRepository,
  settlementRepository
)

export const getAdminSettlementsUseCase = new GetAdminSettlementsUseCase(
  settlementRepository,
  bookingRepository
)
export const getAdminSettlementMetricsUseCase = new GetAdminSettlementMetricsUseCase(
  settlementRepository
)
export const getSettlementByIdUseCase = new GetSettlementByIdUseCase(
  settlementRepository,
  ownerRepository,
  bookingRepository
)
export const retrySettlementUseCase = new RetrySettlementUseCase(
  settlementRepository,
  processSettlementUseCase
)
export const manageSettlementHoldUseCase = new ManageSettlementHoldUseCase(settlementRepository)
export const processPendingSettlementsUseCase = new ProcessPendingSettlementsUseCase(
  settlementRepository,
  processSettlementUseCase
)
export const handlePayoutWebhookUseCase = new HandlePayoutWebhookUseCase(
  payoutRepository,
  settlementRepository,
  razorpayXPayoutProvider,
  verifyRazorpayXWebhookSignature
)

// Controllers
export const settlementController = new SettlementController(
  getOwnerSettlementSummaryUseCase,
  getOwnerSettlementsUseCase,
  getOwnerEarningsHistoryUseCase,
  getAdminSettlementsUseCase,
  getAdminSettlementMetricsUseCase,
  getSettlementByIdUseCase,
  retrySettlementUseCase,
  manageSettlementHoldUseCase
)
export const payoutWebhookController = new PayoutWebhookController(handlePayoutWebhookUseCase)

// Router
export const settlementRouter = createSettlementRouter(
  settlementController,
  payoutWebhookController
)

export * from "./domain/entities/Settlement"
export * from "./domain/entities/Payout"
export * from "./domain/repositories/settlement.repository.interface"
export * from "./domain/repositories/payout.repository.interface"
export * from "./application/dtos/settlement.dto"
export * from "./application/interfaces/settlement-usecases.interface"

export default settlementRouter
