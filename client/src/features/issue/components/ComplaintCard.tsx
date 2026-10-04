import { useState } from "react"
import { AlertCircle, Clock } from "lucide-react"

interface ComplaintCardProps {
  description: string
  category?: string
  createdAt: string
}

export default function ComplaintCard({
  description,
  category = "Vehicle Damage",
  createdAt,
}: ComplaintCardProps) {
  const [nowMs] = useState(() => Date.now())

  const getRelativeTime = (dateStr: string) => {
    try {
      const created = new Date(dateStr).getTime()
      const diffMs = Math.max(0, nowMs - created)
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays >= 1) return `Reported ${diffDays} day${diffDays > 1 ? "s" : ""} ago`
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours >= 1) return `Reported ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return `Reported ${diffMins} min${diffMins > 1 ? "s" : ""} ago`
    } catch {
      return "Recently reported"
    }
  }

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border shadow-xl space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Customer Complaint</h3>
            <span className="text-xs text-muted-foreground">Category: {category}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{getRelativeTime(createdAt)}</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/60">
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic font-normal">
          "{description}"
        </p>
      </div>
    </div>
  )
}
