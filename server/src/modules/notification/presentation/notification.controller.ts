import { Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import success from "@/common/utils/success"
import { AppError } from "@/common/errors/app-error"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import {
  ICreateNotificationUseCase,
  IDeleteNotificationUseCase,
  IGetNotificationByIdUseCase,
  IGetNotificationsUseCase,
  IGetUnreadNotificationCountUseCase,
  IMarkAllNotificationsAsReadUseCase,
  IMarkNotificationAsActionedUseCase,
  IMarkNotificationAsReadUseCase,
} from "../application/interfaces/notification-usecases.interface"

export class NotificationController {
  constructor(
    private readonly createNotificationUseCase: ICreateNotificationUseCase,
    private readonly getNotificationsUseCase: IGetNotificationsUseCase,
    private readonly getNotificationByIdUseCase: IGetNotificationByIdUseCase,
    private readonly markNotificationAsReadUseCase: IMarkNotificationAsReadUseCase,
    private readonly markAllNotificationsAsReadUseCase: IMarkAllNotificationsAsReadUseCase,
    private readonly markNotificationAsActionedUseCase: IMarkNotificationAsActionedUseCase,
    private readonly deleteNotificationUseCase: IDeleteNotificationUseCase,
    private readonly getUnreadNotificationCountUseCase: IGetUnreadNotificationCountUseCase
  ) {}

  getAll = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const result = await this.getNotificationsUseCase.execute(userId, req.query)
    success(res, result, HTTP_STATUS.OK, "Notifications retrieved successfully")
  }

  getById = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const id = req.params.id as string
    if (!id) {
      throw new AppError("Notification ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const result = await this.getNotificationByIdUseCase.execute(id, userId)
    success(res, result, HTTP_STATUS.OK, "Notification retrieved successfully")
  }

  create = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.body.userId || req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const dto = {
      ...req.body,
      userId,
    }

    const result = await this.createNotificationUseCase.execute(dto)
    success(res, result, HTTP_STATUS.CREATED, "Notification created successfully")
  }

  markAsRead = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const id = req.params.id as string
    if (!id) {
      throw new AppError("Notification ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const result = await this.markNotificationAsReadUseCase.execute(id, userId)
    success(res, result, HTTP_STATUS.OK, "Notification marked as read")
  }

  markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const result = await this.markAllNotificationsAsReadUseCase.execute(userId)
    success(res, result, HTTP_STATUS.OK, "All notifications marked as read")
  }

  markAsActioned = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const id = req.params.id as string
    if (!id) {
      throw new AppError("Notification ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const result = await this.markNotificationAsActionedUseCase.execute(id, userId)
    success(res, result, HTTP_STATUS.OK, "Notification marked as actioned")
  }

  delete = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const id = req.params.id as string
    if (!id) {
      throw new AppError("Notification ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    await this.deleteNotificationUseCase.execute(id, userId)
    success(res, null, HTTP_STATUS.OK, "Notification deleted successfully")
  }

  getUnreadCount = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const result = await this.getUnreadNotificationCountUseCase.execute(userId)
    success(res, result, HTTP_STATUS.OK, "Unread count retrieved successfully")
  }
}
