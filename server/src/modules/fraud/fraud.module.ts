import { FraudRedisService } from "./infrastructure/services/fraud-redis.service"
import { FraudEventMongoRepository } from "./infrastructure/repositories/fraud-event.mongo.repository"
import { FraudDetectorService } from "./application/services/fraud-detector.service"
import { EvaluateRiskUseCase } from "./application/use-cases/evaluate-risk.use-case"
import { ListFraudEventsUseCase } from "./application/use-cases/list-fraud-events.use-case"
import { GetFraudEventUseCase } from "./application/use-cases/get-fraud-event.use-case"
import { UpdateFraudEventStatusUseCase } from "./application/use-cases/update-fraud-event-status.use-case"
import { GetUserFraudProfileUseCase } from "./application/use-cases/get-user-fraud-profile.use-case"
import { GetFraudMetricsUseCase } from "./application/use-cases/get-fraud-metrics.use-case"
import { GetFraudWatchlistUseCase } from "./application/use-cases/get-fraud-watchlist.use-case"
import { GetFraudSecurityLogsUseCase } from "./application/use-cases/get-fraud-security-logs.use-case"
import { AdminFraudController } from "./presentation/controllers/admin-fraud.controller"
import { createFraudRouter } from "./presentation/routers/admin-fraud.routes"

import { ExcessiveCancellationsRule } from "./infrastructure/rules/customer/excessive-cancellations.rule"
import { ExcessivePaymentFailuresRule } from "./infrastructure/rules/customer/excessive-payment-failures.rule"
import { RapidBookingRule } from "./infrastructure/rules/customer/rapid-booking.rule"
import { RepeatedNoShowRule } from "./infrastructure/rules/customer/repeated-no-show.rule"
import { SuspiciousWalletActivityRule } from "./infrastructure/rules/customer/suspicious-wallet-activity.rule"
import { SuspiciousReviewRule } from "./infrastructure/rules/customer/suspicious-review.rule"

import { BurstBookingCreationRule } from "./infrastructure/rules/booking/burst-booking-creation.rule"
import { UnusualBookingFrequencyRule } from "./infrastructure/rules/booking/unusual-booking-frequency.rule"
import { BookingPaymentDiscrepancyRule } from "./infrastructure/rules/booking/booking-payment-discrepancy.rule"

import { ExcessiveWalkinCreationRule } from "./infrastructure/rules/ops/excessive-walkin-creation.rule"
import { SuspiciousManagerCancellationRule } from "./infrastructure/rules/ops/suspicious-manager-cancellation.rule"
import { ServiceStatusFlappingRule } from "./infrastructure/rules/ops/service-status-flapping.rule"
import { ExcessiveRefundIssuanceRule } from "./infrastructure/rules/ops/excessive-refund-issuance.rule"

import { DeviceAccountSharingRule } from "./infrastructure/rules/account/device-account-sharing.rule"
import { LoginVelocityAbuseRule } from "./infrastructure/rules/account/login-velocity-abuse.rule"
import { SuspendedAccountActivityRule } from "./infrastructure/rules/account/suspended-account-activity.rule"

export const fraudCacheService = new FraudRedisService()
export const fraudEventRepository = new FraudEventMongoRepository()

export const fraudRules = [
  new ExcessiveCancellationsRule(fraudCacheService),
  new ExcessivePaymentFailuresRule(fraudCacheService),
  new RapidBookingRule(fraudCacheService),
  new RepeatedNoShowRule(fraudCacheService),
  new SuspiciousWalletActivityRule(fraudCacheService),
  new SuspiciousReviewRule(fraudCacheService),
  new BurstBookingCreationRule(fraudCacheService),
  new UnusualBookingFrequencyRule(fraudCacheService),
  new BookingPaymentDiscrepancyRule(),
  new ExcessiveWalkinCreationRule(fraudCacheService),
  new SuspiciousManagerCancellationRule(fraudCacheService),
  new ServiceStatusFlappingRule(fraudCacheService),
  new ExcessiveRefundIssuanceRule(fraudCacheService),
  new DeviceAccountSharingRule(fraudCacheService),
  new LoginVelocityAbuseRule(fraudCacheService),
  new SuspendedAccountActivityRule(),
]

export const fraudDetectorService = new FraudDetectorService(fraudRules)

export const evaluateRiskUseCase = new EvaluateRiskUseCase(
  fraudDetectorService,
  fraudEventRepository
)
export const listFraudEventsUseCase = new ListFraudEventsUseCase(fraudEventRepository)
export const getFraudEventUseCase = new GetFraudEventUseCase(fraudEventRepository)
export const updateFraudEventStatusUseCase = new UpdateFraudEventStatusUseCase(fraudEventRepository)
export const getUserFraudProfileUseCase = new GetUserFraudProfileUseCase(fraudEventRepository)
export const getFraudMetricsUseCase = new GetFraudMetricsUseCase(fraudEventRepository)
export const getFraudWatchlistUseCase = new GetFraudWatchlistUseCase(fraudEventRepository)
export const getFraudSecurityLogsUseCase = new GetFraudSecurityLogsUseCase(fraudEventRepository)

export const adminFraudController = new AdminFraudController(
  listFraudEventsUseCase,
  getFraudEventUseCase,
  updateFraudEventStatusUseCase,
  getUserFraudProfileUseCase,
  evaluateRiskUseCase,
  getFraudMetricsUseCase,
  getFraudWatchlistUseCase,
  getFraudSecurityLogsUseCase
)

const fraudRouter = createFraudRouter(adminFraudController)
export default fraudRouter
