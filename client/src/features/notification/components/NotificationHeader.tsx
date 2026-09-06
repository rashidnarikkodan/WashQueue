import { Bell, CheckCheck, X, Search } from "lucide-react"

interface NotificationHeaderProps {
  unreadCount: number
  searchQuery: string
  onSearchChange: (val: string) => void
  onMarkAllAsRead: () => void
  onClose: () => void
}

export function NotificationHeader({
  unreadCount,
  searchQuery,
  onSearchChange,
  onMarkAllAsRead,
  onClose,
}: NotificationHeaderProps) {
  return (
    <div className="flex flex-col p-5 pb-3 gap-3.5 border-b border-border/50 bg-muted/20">
      {/* Top Title & Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
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
              type="button"
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer border border-primary/20 shadow-xs"
              title="Mark all notifications as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close notifications panel"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative flex items-center bg-muted/40 border border-border/70 rounded-xl px-3 py-2 text-sm text-foreground focus-within:border-primary/60 focus-within:bg-muted/60 transition-all">
        <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search notification messages..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent border-none outline-none text-xs text-foreground placeholder-muted-foreground w-full"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
