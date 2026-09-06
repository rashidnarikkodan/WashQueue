import { Bell, Sparkles, SearchX } from "lucide-react"
import type { NotificationTabType } from "../types"

interface NotificationEmptyStateProps {
  searchQuery: string
  activeTab: NotificationTabType
}

export function NotificationEmptyState({ searchQuery, activeTab }: NotificationEmptyStateProps) {
  if (searchQuery.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in duration-200">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 mb-3 border border-border/60 text-muted-foreground">
          <SearchX className="h-6 w-6" />
        </div>
        <p className="text-sm font-bold text-foreground">No matches found</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          No notifications match &ldquo;{searchQuery}&rdquo;. Try searching with different keywords.
        </p>
      </div>
    )
  }

  if (activeTab === "unread") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in duration-200">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 mb-3 border border-emerald-500/20 text-emerald-500">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="text-sm font-bold text-foreground">All caught up!</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          You have no unread notifications right now.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in duration-200">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 mb-3 border border-border/60 text-muted-foreground">
        <Bell className="h-6 w-6" />
      </div>
      <p className="text-sm font-bold text-foreground">No notifications</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        {activeTab === "all"
          ? "When you receive booking, payment, or queue updates, they will appear here."
          : `No ${activeTab.toLowerCase()} notifications found.`}
      </p>
    </div>
  )
}
