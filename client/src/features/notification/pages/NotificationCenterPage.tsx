import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useNotificationStore } from "../store/notification.store"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { ROLE, VIEW_MODE } from "@/shared/constants/role.const"
import type { NotificationDto, NotificationType } from "@/shared/types/notification.types"
import type { TabConfig, SelectFilter } from "@/shared/components/data-table/types"

import DataTableToolbar from "@/shared/components/data-table/DataTableToolbar"
import Pagination from "@/shared/components/ui/Pagination"
import { NotificationCenterHeader } from "../components/NotificationCenterHeader"
import { NotificationCenterCard } from "../components/NotificationCenterCard"
import { NotificationSkeletonList } from "../components/NotificationSkeletonList"
import { NotificationEmptyState } from "../components/NotificationEmptyState"
import { getSocketClient } from "@/shared/services/socket.client"

const NOTIFICATION_TABS: TabConfig[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "BOOKING", label: "Booking Alerts" },
  { id: "QUEUE", label: "Queue Updates" },
  { id: "PAYMENT", label: "Payments & Refunds" },
  { id: "SYSTEM", label: "System Alerts" },
]

export function NotificationCenterPage() {
  const navigate = useNavigate()
  const { user, activeViewMode } = useAuthStore()
  const {
    notifications,
    unreadCount,
    total,
    totalPages,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  } = useNotificationStore()

  const [activeTab, setActiveTab] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(20)
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // Sync tab change with internal filters
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setCurrentPage(1)
  }

  // Load data from server
  const loadData = useCallback(() => {
    let isRead: boolean | undefined
    if (activeTab === "unread" || statusFilter === "UNREAD") {
      isRead = false
    } else if (statusFilter === "READ") {
      isRead = true
    }

    const type =
      activeTab !== "all" && activeTab !== "unread"
        ? (activeTab as NotificationType)
        : typeFilter !== "ALL"
          ? (typeFilter as NotificationType)
          : undefined

    fetchNotifications({
      page: currentPage,
      limit,
      isRead,
      type,
    })
  }, [activeTab, statusFilter, typeFilter, currentPage, limit, fetchNotifications])

  useEffect(() => {
    loadData()
    fetchUnreadCount()
  }, [loadData, fetchUnreadCount])

  useEffect(() => {
    const socket = getSocketClient()

    function handleNewNotification(notification: NotificationDto) {
      addNotification(notification)
    }

    socket.on("NOTIFICATION_RECEIVED", handleNewNotification)

    return () => {
      socket.off("NOTIFICATION_RECEIVED", handleNewNotification)
    }
  }, [addNotification])

  // Filter notifications in-memory by search query
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications
    const q = searchQuery.toLowerCase()
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q)
    )
  }, [notifications, searchQuery])

  // Filter configurations for DataTableToolbar
  const selectFilters: SelectFilter[] = [
    {
      id: "typeFilter",
      label: "Category",
      value: typeFilter,
      onChange: (val) => {
        setTypeFilter(val)
        setCurrentPage(1)
      },
      options: [
        { label: "All Categories", value: "ALL" },
        { label: "Bookings", value: "BOOKING" },
        { label: "Queue", value: "QUEUE" },
        { label: "Payments", value: "PAYMENT" },
        { label: "System", value: "SYSTEM" },
      ],
    },
    {
      id: "statusFilter",
      label: "Read Status",
      value: statusFilter,
      onChange: (val) => {
        setStatusFilter(val)
        setCurrentPage(1)
      },
      options: [
        { label: "All Status", value: "ALL" },
        { label: "Unread Only", value: "UNREAD" },
        { label: "Read Only", value: "READ" },
      ],
    },
  ]

  const handleNotificationClick = async (n: NotificationDto) => {
    if (!n.isRead) {
      await markAsRead(n.id)
    }

    if (n.actionType === "NAVIGATE") {
      let parsedData: Record<string, unknown> = {}
      try {
        if (typeof n.data === "object") parsedData = n.data as Record<string, unknown>
        else if (n.data) parsedData = JSON.parse(n.data)
      } catch {
        /* ignore JSON parse error */
      }

      if (typeof parsedData.url === "string") {
        navigate(parsedData.url)
        return
      }

      const isOwnerMode = activeViewMode === VIEW_MODE.OWNER
      const isManagerMode = activeViewMode === VIEW_MODE.MANAGER

      if (n.type === "BOOKING") {
        if (parsedData.bookingId) {
          const basePath =
            user?.role === ROLE.ADMIN
              ? "/admin/bookings"
              : isOwnerMode
                ? "/owner/bookings"
                : isManagerMode
                  ? "/manager/bookings"
                  : "/bookings"
          navigate(`${basePath}/${parsedData.bookingId}`)
        } else {
          navigate(
            user?.role === ROLE.ADMIN
              ? "/admin/bookings"
              : isOwnerMode
                ? "/owner/bookings"
                : isManagerMode
                  ? "/manager/bookings"
                  : "/bookings"
          )
        }
      } else if (n.type === "QUEUE") {
        if (user?.role === ROLE.ADMIN) {
          navigate("/admin/queues")
        } else if (isOwnerMode) {
          navigate("/owner/queues")
        } else if (isManagerMode) {
          navigate("/manager/queue")
        } else {
          navigate("/queue")
        }
      } else if (n.type === "PAYMENT") {
        if (user?.role === ROLE.ADMIN) {
          navigate("/admin/settlements")
        } else if (isOwnerMode) {
          navigate("/owner/financial-records")
        } else {
          navigate("/wallet")
        }
      }
    }
  }

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await markAsRead(id)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteNotification(id)
  }

  const handleOpenSettings = () => {
    if (user?.role === ROLE.ADMIN) {
      navigate("/admin/settings")
    } else if (activeViewMode === VIEW_MODE.OWNER) {
      navigate("/owner/profile")
    } else if (activeViewMode === VIEW_MODE.MANAGER) {
      navigate("/manager/profile")
    } else {
      navigate("/profile")
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-8 max-w-7xl">
      {/* Top Header */}
      <NotificationCenterHeader
        unreadCount={unreadCount}
        onMarkAllAsRead={markAllAsRead}
        onOpenSettings={handleOpenSettings}
      />

      {/* Search & Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by booking ID, station, or message..."
        searchLabel="Search Notifications"
        tabs={NOTIFICATION_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectFilters={selectFilters}
      />

      {/* Notifications List Card Container */}
      <div className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-md overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-6">
            <NotificationSkeletonList count={5} />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-border/30">
            {filteredNotifications.map((n) => (
              <NotificationCenterCard
                key={n.id}
                notification={n}
                onClick={handleNotificationClick}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="py-20">
            <NotificationEmptyState />
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md">
          <Pagination
            meta={{
              page: currentPage,
              limit,
              total,
              totalPages,
              hasNextPage: currentPage < totalPages,
              hasPrevPage: currentPage > 1,
            }}
            onPageChange={(p) => setCurrentPage(p)}
            onLimitChange={(l) => {
              setLimit(l)
              setCurrentPage(1)
            }}
            pageSizeOptions={[10, 20, 50]}
            showFirstLast
          />
        </div>
      )}
    </div>
  )
}

export default NotificationCenterPage
