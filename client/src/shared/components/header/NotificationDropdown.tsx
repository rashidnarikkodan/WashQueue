import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell,
  CheckCheck,
  X,
  Search,
  Trash2,
  Calendar,
  CreditCard,
  Activity,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react"
import { useNotificationStore } from "@/features/notification/store/notification.store"
import { useAuthStore } from "@/features/auth/store/auth.store"
import type { NotificationDto, NotificationType } from "@/shared/types/notification.types"
import { ROLE } from "@/shared/constants/role.const"

type TabType = "all" | "unread" | NotificationType

export default function NotificationDropdown() {
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
  const [activeTab, setActiveTab] = useState<TabType>("all")

  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch unread count initially and periodically
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

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter by search query
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications

    const q = searchQuery.toLowerCase()
    return notifications.filter(
      (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
    )
  }, [notifications, searchQuery])

  const formatTimeAgo = (dateInput: string | Date | undefined) => {
    if (!dateInput) return "Recently"
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

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

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case "BOOKING":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "PAYMENT":
        return <CreditCard className="h-5 w-5 text-emerald-500" />
      case "QUEUE":
        return <Activity className="h-5 w-5 text-amber-500" />
      case "SYSTEM":
        return <ShieldAlert className="h-5 w-5 text-purple-400" />
      default:
        return <Bell className="h-5 w-5 text-primary" />
    }
  }

  const getIconBackground = (type: NotificationType) => {
    switch (type) {
      case "BOOKING":
        return "bg-blue-500/10 border-blue-500/20"
      case "PAYMENT":
        return "bg-emerald-500/10 border-emerald-500/20"
      case "QUEUE":
        return "bg-amber-500/10 border-amber-500/20"
      case "SYSTEM":
        return "bg-purple-500/10 border-purple-500/20"
      default:
        return "bg-primary/10 border-primary/20"
    }
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "BOOKING", label: "Bookings" },
    { key: "PAYMENT", label: "Payments" },
    { key: "QUEUE", label: "Queue" },
    { key: "SYSTEM", label: "System" },
  ]

  return (
    <div className="relative" ref={containerRef}>
      {/* Header Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold text-primary-foreground shadow-sm animate-in zoom-in-50">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[440px] md:w-[480px] max-w-[92vw] origin-top-right rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
          {/* Header Bar */}
          <div className="flex flex-col p-5 pb-3 gap-3.5 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground leading-tight">Notifications</h2>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount > 0
                      ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
                      : "All caught up"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer border border-primary/20"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center bg-muted/40 border border-border/70 rounded-xl px-3 py-2 text-sm text-foreground focus-within:border-primary/60 focus-within:bg-muted/60 transition-all">
              <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search notification messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-foreground placeholder-muted-foreground w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1 text-xs font-bold rounded-full border transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[440px] scrollbar-none">
            {isLoading ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3.5 p-4 rounded-2xl bg-muted/30 border border-border/40 animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-1/2 bg-muted rounded" />
                      <div className="h-3 w-3/4 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`group flex items-start gap-3.5 rounded-2xl p-4 transition-all duration-200 border cursor-pointer relative overflow-hidden ${
                    !n.isRead
                      ? "bg-primary/5 border-primary/30 hover:bg-primary/10"
                      : "bg-card hover:bg-muted/40 border-border/50"
                  }`}
                >
                  {/* Left Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${getIconBackground(
                      n.type
                    )} shadow-sm`}
                  >
                    {renderIcon(n.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4
                          className={`text-xs font-extrabold truncate ${
                            !n.isRead ? "text-foreground" : "text-foreground/80"
                          }`}
                        >
                          {n.title}
                        </h4>
                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      </div>

                      <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>

                    {/* Action button if actionable */}
                    {n.actionType === "NAVIGATE" && (
                      <div className="pt-1.5 flex items-center gap-2">
                        <button
                          onClick={(e) => handleActionClick(e, n)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer ${
                            n.isActioned
                              ? "bg-muted text-muted-foreground border border-border/60"
                              : "bg-primary text-primary-foreground hover:opacity-90"
                          }`}
                        >
                          {n.isActioned ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              <span>Viewed</span>
                            </>
                          ) : (
                            <>
                              <span>View Details</span>
                              <ExternalLink className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 self-center">
                    <button
                      onClick={(e) => handleDelete(e, n.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/40 mb-3 border border-border/60">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-bold text-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  {searchQuery
                    ? "No notifications matching your search query."
                    : activeTab === "unread"
                      ? "You have caught up with all your notifications."
                      : "When you receive booking or account updates, they will appear here."}
                </p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/10 text-xs font-semibold text-muted-foreground">
            <span>Notification Center</span>
            {unreadCount > 0 && (
              <span className="text-primary font-bold">{unreadCount} unread</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
