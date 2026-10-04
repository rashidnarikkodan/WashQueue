import { bookingRepository } from "@/modules/booking/booking.module"
import { notificationDispatcherService } from "@/modules/notification/notification.module"
import { IssueMongoRepository } from "./infrastructure/repositories/issue.mongo.repository"
import { CreateIssueUseCase } from "./application/use-cases/create-issue.use-case"
import { GetIssueByIdUseCase } from "./application/use-cases/get-issue-by-id.use-case"
import { GetCustomerIssuesUseCase } from "./application/use-cases/get-customer-issues.use-case"
import { GetStationIssuesUseCase } from "./application/use-cases/get-station-issues.use-case"
import { GetAdminIssuesUseCase } from "./application/use-cases/get-admin-issues.use-case"
import { UpdateIssueStatusUseCase } from "./application/use-cases/update-issue-status.use-case"
import { AssignIssueUseCase } from "./application/use-cases/assign-issue.use-case"
import { ResolveIssueUseCase } from "./application/use-cases/resolve-issue.use-case"
import { EscalateIssueUseCase } from "./application/use-cases/escalate-issue.use-case"
import { CloseIssueUseCase } from "./application/use-cases/close-issue.use-case"
import { IssueController } from "./presentation/controllers/issue.controller"
import { createIssueRouter } from "./presentation/routers/issue.routes"

// Repository (Data Access)
export const issueRepository = new IssueMongoRepository()

// Use Cases (Application Layer)
export const createIssueUseCase = new CreateIssueUseCase(
  issueRepository,
  bookingRepository,
  notificationDispatcherService
)
export const getIssueByIdUseCase = new GetIssueByIdUseCase(issueRepository)
export const getCustomerIssuesUseCase = new GetCustomerIssuesUseCase(issueRepository)
export const getStationIssuesUseCase = new GetStationIssuesUseCase(issueRepository)
export const getAdminIssuesUseCase = new GetAdminIssuesUseCase(issueRepository)
export const updateIssueStatusUseCase = new UpdateIssueStatusUseCase(issueRepository)
export const assignIssueUseCase = new AssignIssueUseCase(issueRepository)
export const resolveIssueUseCase = new ResolveIssueUseCase(
  issueRepository,
  notificationDispatcherService
)
export const escalateIssueUseCase = new EscalateIssueUseCase(
  issueRepository,
  notificationDispatcherService
)
export const closeIssueUseCase = new CloseIssueUseCase(issueRepository)

// Controller (Presentation Layer)
export const issueController = new IssueController(
  createIssueUseCase,
  getIssueByIdUseCase,
  getCustomerIssuesUseCase,
  getStationIssuesUseCase,
  getAdminIssuesUseCase,
  updateIssueStatusUseCase,
  assignIssueUseCase,
  resolveIssueUseCase,
  escalateIssueUseCase,
  closeIssueUseCase
)

// Router
export const issueRouter = createIssueRouter(issueController)

export * from "./domain/entities/Issue"
export * from "./domain/value-objects/issue-status.vo"
export * from "./domain/value-objects/issue-priority.vo"
export * from "./domain/value-objects/issue-category.vo"
export * from "./domain/value-objects/resolution-type.vo"
export * from "./domain/value-objects/evidence.vo"
export * from "./domain/repositories/issue.repository.interface"
export * from "./application/dtos/issue.dto"
export * from "./application/interfaces/issue-usecases.interface"

export default issueRouter
