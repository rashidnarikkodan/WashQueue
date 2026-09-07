import React from "react"
import { Droplets, Activity, Shield, Sparkles, Bell, Check } from "lucide-react"
import type { NotificationDto, NotificationType } from "@/shared/types/notification.types"

interface NotificationItemCardProps {
  notification: NotificationDto
  onClick: (n: NotificationDto) => void
  onActionClick: (e: React.MouseEvent, n: NotificationDto) => void
  onMarkAsRead?: (e: React.MouseEvent, id: string) => void
}

export function NotificationItemCard({
  notification: n,
  onClick,
  onActionClick,
  onMarkAsRead,
}: NotificationItemCardProps) {
  const formatTimeAgo = (dateInput: string | Date | undefined) => {
    if (!dateInput) return "JUST NOW"
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "JUST NOW"
    if (diffMins < 60) return `${diffMins} MINS AGO`
    if (diffHours < 24) return `${diffHours} HOURS AGO`
    if (diffDays === 1) return "YESTERDAY"
    return `${diffDays} DAYS AGO`
  }

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case "BOOKING":
        return <Droplets className="h-5 w-5 text-primary" />
      case "QUEUE":
        return <Activity className="h-5 w-5 text-emerald-500" />
      case "SYSTEM":
        return <Shield className="h-5 w-5 text-red-400" />
      case "PAYMENT":
        return <Sparkles className="h-5 w-5 text-primary" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getIconBackground = (type: NotificationType) => {
    switch (type) {
      case "BOOKING":
      case "PAYMENT":
        return "bg-primary/10"
      case "QUEUE":
        return "bg-emerald-500/10"
      case "SYSTEM":
        return "bg-red-500/10"
      default:
        return "bg-muted"
    }
  }

  let imageUrl: string | undefined
  if (n.data) {
    try {
      const parsed = typeof n.data === "string" ? JSON.parse(n.data) : n.data
      imageUrl = parsed?.image || parsed?.imageUrl
    } catch {
      imageUrl = undefined
    }
  }

  const isUnread = !n.isRead

  return (
    <div
      onClick={() => onClick(n)}
      className={`group flex flex-col gap-3 rounded-2xl p-4 transition-all duration-200 bg-muted/30 border border-border/40 hover:bg-muted/50 relative overflow-hidden cursor-pointer ${
        isUnread ? "border-l-4 border-l-primary" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${getIconBackground(
              n.type
            )}`}
          >
            {renderIcon(n.type)}
          </div>
          {isUnread && (
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-primary" />
          )}
        </div>

        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{n.title}</h3>
              {n.type === "QUEUE" && (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                {formatTimeAgo(n.createdAt)}
              </span>
              {onMarkAsRead && isUnread && (
                <button
                  type="button"
                  onClick={(e) => onMarkAsRead(e, n.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary rounded-md hover:bg-primary/10 transition-all cursor-pointer"
                  title="Mark as read"
                  aria-label="Mark as read"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>

          {imageUrl && (
            <div className="mt-2.5 rounded-xl overflow-hidden h-28 w-full border border-border/60">
              <img src={imageUrl} alt={n.title} className="w-full h-full object-cover" />
            </div>
          )}

          {n.actionType === "NAVIGATE" && (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => onActionClick(e, n)}
                className="px-3.5 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                View Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
