import { Bell, Check, X, Search } from "lucide-react"

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
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bell className="h-5.5 w-5.5" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
              title="Mark all as read"
            >
              <Check className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-red-500/80 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
            title="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center bg-muted/50 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground focus-within:border-primary/50 transition-colors">
        <Search className="h-4.5 w-4.5 text-muted-foreground mr-2" />
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-foreground placeholder-muted-foreground w-full"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </>
  )
}
