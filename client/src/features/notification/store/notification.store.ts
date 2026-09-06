import { create } from "zustand"
import { notificationApi } from "@/shared/apis/notification.api"
import type {
  GetNotificationsQuery,
  NotificationDto,
  PaginatedNotificationsDto,
} from "@/shared/types/notification.types"

interface NotificationStore {
  notifications: NotificationDto[]
  unreadCount: number
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  error: string | null

  fetchNotifications: (query?: GetNotificationsQuery) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  markAsActioned: (id: string) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  addNotification: (item: NotificationDto) => void
}

let latestFetchRequestId = 0

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,

  fetchNotifications: async (query = {}) => {
    const requestId = ++latestFetchRequestId
    set({ isLoading: true, error: null })
    try {
      const data: PaginatedNotificationsDto = await notificationApi.getNotifications(query)
      if (latestFetchRequestId !== requestId) return

      set({
        notifications: data.items,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        unreadCount: data.unreadCount,
        isLoading: false,
      })
    } catch (err) {
      if (latestFetchRequestId !== requestId) return
      set({
        error: err instanceof Error ? err.message : "Failed to load notifications",
        isLoading: false,
      })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const unreadCount = await notificationApi.getUnreadCount()
      set({ unreadCount })
    } catch {
      // Silently ignore polling errors for unread counter badge
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic update: remove from unread notifications list
    const previousNotifications = get().notifications
    const target = previousNotifications.find((n) => n.id === id)
    if (!target) return

    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: Math.max(0, state.unreadCount - 1),
      total: Math.max(0, state.total - 1),
    }))

    try {
      await notificationApi.markAsRead(id)
    } catch {
      // Revert if API fails
      set({
        notifications: previousNotifications,
        unreadCount: get().unreadCount + 1,
        total: previousNotifications.length,
      })
    }
  },

  markAllAsRead: async () => {
    const previousNotifications = get().notifications
    const previousUnread = get().unreadCount
    if (previousNotifications.length === 0 && previousUnread === 0) return

    // Optimistic update: clear unread list
    set({
      notifications: [],
      unreadCount: 0,
      total: 0,
    })

    try {
      await notificationApi.markAllAsRead()
    } catch {
      // Revert if API fails
      set({
        notifications: previousNotifications,
        unreadCount: previousUnread,
        total: previousNotifications.length,
      })
    }
  },

  markAsActioned: async (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isActioned: true } : n)),
    }))

    try {
      await notificationApi.markAsActioned(id)
    } catch {
      // Silently catch
    }
  },

  deleteNotification: async (id: string) => {
    const previousNotifications = get().notifications
    const target = previousNotifications.find((n) => n.id === id)

    // Optimistic deletion
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      total: Math.max(0, state.total - 1),
      unreadCount:
        target && !target.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    }))

    try {
      await notificationApi.deleteNotification(id)
    } catch {
      // Revert
      set({
        notifications: previousNotifications,
        total: previousNotifications.length,
      })
    }
  },

  addNotification: (item: NotificationDto) => {
    set((state) => ({
      notifications: [item, ...state.notifications],
      total: state.total + 1,
      unreadCount: item.isRead ? state.unreadCount : state.unreadCount + 1,
    }))
  },
}))
