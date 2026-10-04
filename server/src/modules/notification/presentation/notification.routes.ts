import { Router } from "express"
import { NotificationController } from "./notification.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import {
  createNotificationSchema,
  getNotificationsQuerySchema,
  notificationIdParamSchema,
} from "./schema/notification.schema"
import { API_ROUTES } from "@/common/constants/route.constants"

export const createNotificationRouter = (
  notificationController: NotificationController
): Router => {
  const router = Router()

  router.use(authenticate)

  router.get(
    API_ROUTES.NOTIFICATIONS.UNREAD_COUNT,
    asyncHandler(notificationController.getUnreadCount)
  )

  router.patch(
    API_ROUTES.NOTIFICATIONS.MARK_ALL_READ,
    asyncHandler(notificationController.markAllAsRead)
  )

  router.get(
    API_ROUTES.NOTIFICATIONS.LIST,
    validateRequest(getNotificationsQuerySchema, "query"),
    asyncHandler(notificationController.getAll)
  )

  router.post(
    API_ROUTES.NOTIFICATIONS.CREATE,
    validateRequest(createNotificationSchema, "body"),
    asyncHandler(notificationController.create)
  )

  router.get(
    API_ROUTES.NOTIFICATIONS.GET_BY_ID,
    validateRequest(notificationIdParamSchema, "params"),
    asyncHandler(notificationController.getById)
  )

  router.patch(
    API_ROUTES.NOTIFICATIONS.MARK_AS_READ,
    validateRequest(notificationIdParamSchema, "params"),
    asyncHandler(notificationController.markAsRead)
  )

  router.patch(
    API_ROUTES.NOTIFICATIONS.MARK_AS_ACTIONED,
    validateRequest(notificationIdParamSchema, "params"),
    asyncHandler(notificationController.markAsActioned)
  )

  router.delete(
    API_ROUTES.NOTIFICATIONS.DELETE,
    validateRequest(notificationIdParamSchema, "params"),
    asyncHandler(notificationController.delete)
  )

  return router
}
