import { BookingNotificationService } from "./infrastructure/services/booking-notification.service"
import { NotificationMongoRepository } from "./infrastructure/repositories/notification.mongo.repository"
import { CreateNotificationUseCase } from "./application/use-cases/create-notification.use-case"
import { GetNotificationsUseCase } from "./application/use-cases/get-notifications.use-case"
import { GetNotificationByIdUseCase } from "./application/use-cases/get-notification-by-id.use-case"
import { MarkNotificationAsReadUseCase } from "./application/use-cases/mark-notification-as-read.use-case"
import { MarkAllNotificationsAsReadUseCase } from "./application/use-cases/mark-all-notifications-as-read.use-case"
import { MarkNotificationAsActionedUseCase } from "./application/use-cases/mark-notification-as-actioned.use-case"
import { DeleteNotificationUseCase } from "./application/use-cases/delete-notification.use-case"
import { GetUnreadNotificationCountUseCase } from "./application/use-cases/get-unread-notification-count.use-case"
import { NotificationController } from "./presentation/notification.controller"
import { createNotificationRouter } from "./presentation/notification.routes"

// Repository (Data Access)
export const notificationRepository = new NotificationMongoRepository()

// Use Cases (Application Layer)
export const createNotificationUseCase = new CreateNotificationUseCase(notificationRepository)
export const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository)
export const getNotificationByIdUseCase = new GetNotificationByIdUseCase(notificationRepository)
export const markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(
  notificationRepository
)
export const markAllNotificationsAsReadUseCase = new MarkAllNotificationsAsReadUseCase(
  notificationRepository
)
export const markNotificationAsActionedUseCase = new MarkNotificationAsActionedUseCase(
  notificationRepository
)
export const deleteNotificationUseCase = new DeleteNotificationUseCase(notificationRepository)
export const getUnreadNotificationCountUseCase = new GetUnreadNotificationCountUseCase(
  notificationRepository
)

// Controller (Presentation Layer)
export const notificationController = new NotificationController(
  createNotificationUseCase,
  getNotificationsUseCase,
  getNotificationByIdUseCase,
  markNotificationAsReadUseCase,
  markAllNotificationsAsReadUseCase,
  markNotificationAsActionedUseCase,
  deleteNotificationUseCase,
  getUnreadNotificationCountUseCase
)

// Router
export const notificationRouter = createNotificationRouter(notificationController)

// Backward compatible booking notification service
export const bookingNotificationService = new BookingNotificationService()

export type {
  IBookingNotificationService,
  NotificationEventType,
} from "./application/interfaces/booking-notification.interface"

export * from "./domain/types/notification.types"
export * from "./domain/entities/Notification"
export * from "./domain/repositories/notification.repository.interface"
export * from "./application/interfaces/notification-usecases.interface"
export * from "./application/dtos/create-notification.dto"
export * from "./application/dtos/get-notifications.dto"
export * from "./application/dtos/notification-response.dto"

export default notificationRouter
