import React, { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Trash2, Settings } from "lucide-react"

import { useNotificationStore } from "../store/notification.store"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { ROLE } from "@/shared/constants/role.const"
import type { NotificationDto, NotificationType } from "@/shared/types/notification.types"
import type { NotificationTabType } from "../types"

import { NotificationHeader } from "./NotificationHeader"
import { NotificationFilterTabs } from "./NotificationFilterTabs"
import { NotificationItemCard } from "./NotificationItemCard"
import { NotificationSkeletonList } from "./NotificationSkeletonList"
import { NotificationEmptyState } from "./NotificationEmptyState"

export function NotificationDropdown() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    markAsActioned,
    deleteNotification,
  } = useNotificationStore()

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<NotificationTabType>("all")

  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch unread counter periodically
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Fetch notifications when opened or when tab changes
  const loadData = useCallback(() => {
    const isReadFilter = activeTab === "unread" ? false : undefined
    const typeFilter =
      activeTab !== "all" && activeTab !== "unread" ? (activeTab as NotificationType) : undefined

    fetchNotifications({
      isRead: isReadFilter,
      type: typeFilter,
      limit: 30,
    })
  }, [activeTab, fetchNotifications])

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, loadData])

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter notifications by search text
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications

    const q = searchQuery.toLowerCase()
    return notifications.filter(
      (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
    )
  }, [notifications, searchQuery])

  const parseNotificationData = (raw: string | undefined): Record<string, unknown> => {
    if (!raw) return {}
    try {
      if (typeof raw === "object") return raw as Record<string, unknown>
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }

  const handleNotificationClick = async (n: NotificationDto) => {
    if (!n.isRead) {
      await markAsRead(n.id)
    }

    if (n.actionType === "NAVIGATE") {
      const data = parseNotificationData(n.data)
      setIsOpen(false)

      if (typeof data.url === "string") {
        navigate(data.url)
        return
      }

      if (n.type === "BOOKING") {
        if (data.bookingId) {
          const basePath = user?.role === ROLE.OWNER ? "/owner/bookings" : "/bookings"
          navigate(`${basePath}/${data.bookingId}`)
        } else {
          navigate(user?.role === ROLE.OWNER ? "/owner/bookings" : "/bookings")
        }
      } else if (n.type === "QUEUE") {
        navigate(user?.role === ROLE.OWNER ? "/owner/queues" : "/queue")
      } else if (n.type === "PAYMENT") {
        navigate(user?.role === ROLE.OWNER ? "/owner/financial-records" : "/wallet")
      }
    }
  }

  const handleActionClick = async (e: React.MouseEvent, n: NotificationDto) => {
    e.stopPropagation()
    await markAsActioned(n.id)
    handleNotificationClick(n)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteNotification(id)
  }

  const handleClearAll = async () => {
    await markAllAsRead()
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        )}
      </button>

      {/* Main Notification Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[450px] md:w-[500px] max-w-[90vw] origin-top-right rounded-2xl border border-border/80 bg-card shadow-2xl ring-1 ring-black/5 focus:outline-none overflow-hidden z-50 flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Header & Filter Section */}
          <div className="flex flex-col p-6 pb-4 gap-4 border-b border-border/40">
            <NotificationHeader
              unreadCount={unreadCount}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onMarkAllAsRead={markAllAsRead}
              onClose={() => setIsOpen(false)}
            />
            <NotificationFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Notification Cards List */}
          <div className="flex-1 overflow-y-auto p-6 py-4 space-y-4 max-h-[450px]">
            {isLoading ? (
              <NotificationSkeletonList count={3} />
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <NotificationItemCard
                  key={n.id}
                  notification={n}
                  onClick={handleNotificationClick}
                  onActionClick={handleActionClick}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <NotificationEmptyState />
            )}
          </div>

          {/* Footer Section */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/20">
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                navigate(user?.role === ROLE.OWNER ? "/owner/profile" : "/profile")
              }}
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              Notification Settings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
