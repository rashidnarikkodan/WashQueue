import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"
import type {
  GetNotificationsQuery,
  NotificationDto,
  PaginatedNotificationsDto,
} from "../types/notification.types"

export const notificationApi = {
  getNotifications: async (query?: GetNotificationsQuery): Promise<PaginatedNotificationsDto> => {
    try {
      const response = await api.get(API_ROUTES.NOTIFICATIONS.ROOT, {
        params: query,
        skipToast: true,
      })
      return (
        response.data?.data || {
          items: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 1,
          unreadCount: 0,
        }
      )
    } catch (error) {
      handleApiError(error, "Failed to load notifications")
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get(API_ROUTES.NOTIFICATIONS.UNREAD_COUNT, {
        skipToast: true,
      })
      return response.data?.data?.unreadCount ?? 0
    } catch (error) {
      handleApiError(error, "Failed to load unread count")
    }
  },

  markAsRead: async (id: string): Promise<NotificationDto> => {
    try {
      const response = await api.patch(
        API_ROUTES.NOTIFICATIONS.MARK_READ(id),
        {},
        { skipToast: true }
      )
      return response.data?.data
    } catch (error) {
      handleApiError(error, "Failed to mark notification as read")
    }
  },

  markAllAsRead: async (): Promise<{ modifiedCount: number }> => {
    try {
      const response = await api.patch(API_ROUTES.NOTIFICATIONS.READ_ALL, {}, { skipToast: true })
      return response.data?.data || { modifiedCount: 0 }
    } catch (error) {
      handleApiError(error, "Failed to mark all notifications as read")
    }
  },

  markAsActioned: async (id: string): Promise<NotificationDto> => {
    try {
      const response = await api.patch(
        API_ROUTES.NOTIFICATIONS.MARK_ACTIONED(id),
        {},
        { skipToast: true }
      )
      return response.data?.data
    } catch (error) {
      handleApiError(error, "Failed to mark notification as actioned")
    }
  },

  deleteNotification: async (id: string): Promise<void> => {
    try {
      await api.delete(API_ROUTES.NOTIFICATIONS.BY_ID(id), { skipToast: true })
    } catch (error) {
      handleApiError(error, "Failed to delete notification")
    }
  },
}
