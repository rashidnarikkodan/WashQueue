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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
      <div className="flex flex-col gap-2 max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
          Notifications
        </h1>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          Track operational alerts, booking updates, queue activity, and financial events across
          your WashQueue network.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onMarkAllAsRead}
          disabled={unreadCount === 0}
          className="px-5 py-2.5 rounded-full text-xs md:text-sm font-bold tracking-wider uppercase border border-primary/40 text-primary hover:bg-primary/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          Mark All As Read
        </button>
      </div>
    </div>
  )
}

export default NotificationCenterHeader
