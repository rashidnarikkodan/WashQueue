import { BookingModel } from "@/modules/booking/infrastructure/models/booking.model"
import { StationModel } from "@/modules/station/infrastructure/models/station.model"
import { User } from "@/modules/user/infrastructure/model/user.model"
import { Owner } from "@/modules/owner/infrastructure/model/owner.model"
import { ManagerAssignmentModel } from "@/modules/manager/infrastructure/models/manager-assignment.model"
import { ReviewModel } from "@/modules/review/infrastructure/models/review.model"

import { AnalyticsMongoQueryService } from "./infrastructure/services/analytics.mongo.query-service"
import { GetAdminDashboardUseCase } from "./application/use-cases/get-admin-dashboard.use-case"
import { GetOwnerDashboardUseCase } from "./application/use-cases/get-owner-dashboard.use-case"
import { GetManagerDashboardUseCase } from "./application/use-cases/get-manager-dashboard.use-case"
import { AnalyticsController } from "./presentation/analytics.controller"
import { createAnalyticsRouter } from "./presentation/analytics.routes"

// Query Service
const analyticsQueryService = new AnalyticsMongoQueryService(
  BookingModel,
  StationModel,
  User,
  Owner,
  ManagerAssignmentModel,
  ReviewModel
)

// Use Cases
export const getAdminDashboardUseCase = new GetAdminDashboardUseCase(analyticsQueryService)
export const getOwnerDashboardUseCase = new GetOwnerDashboardUseCase(analyticsQueryService)
export const getManagerDashboardUseCase = new GetManagerDashboardUseCase(analyticsQueryService)

// Controller
export const analyticsController = new AnalyticsController(
  getAdminDashboardUseCase,
  getOwnerDashboardUseCase,
  getManagerDashboardUseCase
)

// Router
export const analyticsRouter = createAnalyticsRouter(analyticsController)

export * from "./domain/types/analytics.types"
export * from "./application/interfaces/analytics-query.interface"
export * from "./application/use-cases/get-admin-dashboard.use-case"
export * from "./application/use-cases/get-owner-dashboard.use-case"
export * from "./application/use-cases/get-manager-dashboard.use-case"
export * from "./presentation/analytics.controller"

export default analyticsRouter
