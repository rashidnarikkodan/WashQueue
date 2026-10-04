import { Bell } from "lucide-react"

export function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Bell className="h-10 w-10 text-muted-foreground/45 mb-2 animate-bounce" />
      <p className="text-sm font-medium text-muted-foreground">No notifications found</p>
    </div>
  )
}
