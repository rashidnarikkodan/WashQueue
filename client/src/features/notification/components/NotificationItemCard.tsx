import React from "react"
import {
  Bell,
  Calendar,
  CreditCard,
  Activity,
  ShieldAlert,
  ExternalLink,
  CheckCircle2,
  Trash2,
} from "lucide-react"
import type { NotificationDto, NotificationType } from "@/shared/types/notification.types"

interface NotificationItemCardProps {
  notification: NotificationDto
  onClick: (n: NotificationDto) => void
  onActionClick: (e: React.MouseEvent, n: NotificationDto) => void
  onDelete: (e: React.MouseEvent, id: string) => void
}

export function NotificationItemCard({
  notification: n,
  onClick,
  onActionClick,
  onDelete,
}: NotificationItemCardProps) {
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

  return (
    <div
      onClick={() => onClick(n)}
      className={`group flex items-start gap-3.5 rounded-2xl p-4 transition-all duration-200 border cursor-pointer relative overflow-hidden ${
        !n.isRead
          ? "bg-primary/5 border-primary/30 hover:bg-primary/10"
          : "bg-card hover:bg-muted/40 border-border/50"
      }`}
    >
      {/* Category Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${getIconBackground(
          n.type
        )} shadow-xs`}
      >
        {renderIcon(n.type)}
      </div>

      {/* Content */}
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

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</p>

        {/* Action Button */}
        {n.actionType === "NAVIGATE" && (
          <div className="pt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => onActionClick(e, n)}
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

      {/* Hover Delete Action */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 self-center">
        <button
          type="button"
          onClick={(e) => onDelete(e, n.id)}
          className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
          title="Delete notification"
          aria-label="Delete notification"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
