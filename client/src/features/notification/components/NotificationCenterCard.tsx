import React from "react"
import {
  AlertTriangle,
  Clock,
  Calendar,
  CreditCard,
  Bell,
  MapPin,
  Hash,
  Check,
  Trash2,
  ChevronRight,
} from "lucide-react"
import type { NotificationDto } from "@/shared/types/notification.types"

interface NotificationCenterCardProps {
  notification: NotificationDto
  onClick?: (n: NotificationDto) => void
  onMarkAsRead?: (e: React.MouseEvent, id: string) => void
  onDelete?: (e: React.MouseEvent, id: string) => void
}

function formatRelativeTime(dateInput: string | Date): string {
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHours = Math.floor(diffMin / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSec < 60) return "Just now"
    if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  } catch {
    return String(dateInput)
  }
}

export function NotificationCenterCard({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
}: NotificationCenterCardProps) {
  const parsedData = React.useMemo(() => {
    if (!notification.data) return {}
    try {
      if (typeof notification.data === "object") {
        return notification.data as Record<string, unknown>
      }
      return JSON.parse(notification.data)
    } catch {
      return {}
    }
  }, [notification.data])

  const referenceTag =
    (parsedData.referenceNumber as string) ||
    (parsedData.bookingId ? `WQ-${String(parsedData.bookingId).toUpperCase()}` : null) ||
    (parsedData.transactionId
      ? `#TRX-${String(parsedData.transactionId).slice(-4).toUpperCase()}`
      : null) ||
    (notification.id ? `#NOTIF-${notification.id.slice(-4).toUpperCase()}` : null)

  const locationTag =
    (parsedData.stationName as string) ||
    (parsedData.location as string) ||
    (parsedData.stationId
      ? `Station #${String(parsedData.stationId).slice(-4).toUpperCase()}`
      : null)

  const getIconAndColors = () => {
    switch (notification.type) {
      case "SYSTEM":
        return {
          icon: <AlertTriangle className="h-6 w-6 text-destructive" />,
          bgColor: "bg-destructive/15 border-destructive/20 text-destructive",
          badgeText: "CRITICAL",
          badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
        }
      case "QUEUE":
        return {
          icon: <Clock className="h-6 w-6 text-primary" />,
          bgColor: "bg-primary/15 border-primary/20 text-primary",
          badgeText: "QUEUE ALERT",
          badgeClass: "bg-primary/10 text-primary border-primary/20",
        }
      case "BOOKING":
        return {
          icon: <Calendar className="h-6 w-6 text-blue-400" />,
          bgColor: "bg-blue-500/15 border-blue-500/20 text-blue-400",
          badgeText: "BOOKING",
          badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        }
      case "PAYMENT":
        return {
          icon: <CreditCard className="h-6 w-6 text-emerald-400" />,
          bgColor: "bg-emerald-500/15 border-emerald-500/20 text-emerald-400",
          badgeText: "PAYMENT",
          badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        }
      default:
        return {
          icon: <Bell className="h-6 w-6 text-foreground/80" />,
          bgColor: "bg-muted/80 border-border text-foreground/80",
          badgeText: "ALERT",
          badgeClass: "bg-muted text-muted-foreground border-border/60",
        }
    }
  }

  const { icon, bgColor, badgeText, badgeClass } = getIconAndColors()

  return (
    <div
      onClick={() => onClick?.(notification)}
      className={`group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 md:p-6 border-b border-border/30 hover:bg-muted/30 transition-all duration-200 cursor-pointer ${
        !notification.isRead ? "bg-primary/5" : ""
      }`}
    >
      {/* Left indicator bar on unread */}
      {!notification.isRead && (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
      )}

      {/* Main Content Info */}
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {/* Unread Glow Dot */}
        <div className="pt-3 md:pt-0 shrink-0">
          <span
            className={`block w-2.5 h-2.5 rounded-full transition-all ${
              !notification.isRead
                ? "bg-primary shadow-xs shadow-primary/60 ring-2 ring-primary/20"
                : "bg-transparent"
            }`}
          />
        </div>

        {/* Themed Icon Box */}
        <div
          className={`flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl border shrink-0 transition-transform group-hover:scale-105 ${bgColor}`}
        >
          {icon}
        </div>

        {/* Title, Badges, Body & Tags */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base font-semibold text-foreground truncate">
              {notification.title}
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${badgeClass}`}
            >
              {badgeText}
            </span>
            {notification.isDeleted && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border bg-muted/60 text-muted-foreground border-border/80">
                Archived
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground/90 leading-relaxed line-clamp-2">
            {notification.message}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1.5 text-xs text-muted-foreground/70">
            {referenceTag && (
              <span className="inline-flex items-center gap-1 font-mono text-muted-foreground/80 bg-muted/40 px-2 py-0.5 rounded-md border border-border/40">
                <Hash className="h-3 w-3 opacity-60" />
                {referenceTag}
              </span>
            )}
            {locationTag && (
              <span className="inline-flex items-center gap-1 text-muted-foreground/80 bg-muted/40 px-2 py-0.5 rounded-md border border-border/40">
                <MapPin className="h-3 w-3 opacity-60" />
                {locationTag}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto shrink-0 gap-3 pt-2 md:pt-0 pl-7 md:pl-0">
        <span className="text-xs font-medium text-muted-foreground/70 whitespace-nowrap">
          {formatRelativeTime(notification.createdAt)}
        </span>

        <div className="flex items-center gap-1.5 opacity-90 md:opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.isRead && onMarkAsRead && !notification.isDeleted && (
            <button
              type="button"
              onClick={(e) => onMarkAsRead(e, notification.id)}
              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted/80 rounded-lg transition-colors cursor-pointer"
              title="Mark as read"
            >
              <Check className="h-4 w-4" />
            </button>
          )}

          {onDelete && !notification.isDeleted && (
            <button
              type="button"
              onClick={(e) => onDelete(e, notification.id)}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
              title="Delete notification"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          {notification.actionType === "NAVIGATE" && (
            <div className="flex items-center text-xs font-semibold text-primary ml-1 group-hover:translate-x-0.5 transition-transform">
              <ChevronRight className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationCenterCard
