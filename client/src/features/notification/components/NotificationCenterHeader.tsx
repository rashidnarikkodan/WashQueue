import { Check } from "lucide-react"

interface NotificationCenterHeaderProps {
  unreadCount: number
  onMarkAllAsRead: () => void
}

export function NotificationCenterHeader({
  unreadCount,
  onMarkAllAsRead,
}: NotificationCenterHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Notifications
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
          Track operational alerts, booking updates, queue activity, and financial events across
          your network
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onMarkAllAsRead}
          disabled={unreadCount === 0}
          className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="h-4 w-4 text-primary" />
          <span>Mark All As Read</span>
        </button>
      </div>
    </div>
  )
}

export default NotificationCenterHeader
