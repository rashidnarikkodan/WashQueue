import { useState, useMemo } from "react"
import { CheckCircle2, AlertCircle, ArrowUpRight, UserCheck } from "lucide-react"
import type { IssueHistoryEntry } from "../types/issue.types"

interface IssueTimelineProps {
  history?: IssueHistoryEntry[]
  createdAt?: string
}

export default function IssueTimeline({ history = [], createdAt }: IssueTimelineProps) {
  const [mountTime] = useState(() => Date.now())

  const formatTimestamp = (dateVal: string | Date | undefined) => {
    if (!dateVal) return "Recently"
    try {
      const d = new Date(dateVal)
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Recently"
    }
  }

  const timelineItems = useMemo(() => {
    if (history.length > 0) return history
    return [
      {
        fromStatus: "NONE",
        toStatus: "OPEN",
        actionBy: "Customer",
        reason: "Initial concern raised via WashQueue booking",
        timestamp: createdAt || new Date(mountTime).toISOString(),
      },
    ]
  }, [history, mountTime, createdAt])

  return (
    <div className="space-y-4 text-left">
      <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
        ACTIVITY &amp; AUDIT TIMELINE
      </span>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {timelineItems.map((item, idx) => {
          const isReview = item.toStatus === "UNDER_REVIEW"
          const isResolved = item.toStatus === "RESOLVED"
          const isClosed = item.toStatus === "CLOSED"
          const isEscalate = item.toStatus === "ESCALATED"

          return (
            <div key={idx} className="relative group">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${
                  isEscalate
                    ? "bg-red-500/20 text-red-400 border-red-500/40"
                    : isResolved || isClosed
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : isReview
                        ? "bg-primary/20 text-primary border-primary/40"
                        : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {isEscalate ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : isResolved || isClosed ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : isReview ? (
                  <UserCheck className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h5 className="text-xs font-bold text-foreground">
                  {item.toStatus === "UNDER_REVIEW"
                    ? "Investigation & Review Started"
                    : item.toStatus === "RESOLVED"
                      ? "Issue Resolved by Station/Admin"
                      : item.toStatus === "CLOSED"
                        ? "Case Closed"
                        : item.toStatus === "ESCALATED"
                          ? "Escalated to Platform Admin"
                          : "Issue Logged"}
                </h5>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>

              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {item.reason || `Status updated from ${item.fromStatus} to ${item.toStatus}`}
              </p>

              {item.actionBy && (
                <span className="text-[10px] text-muted-foreground/80 font-medium block mt-0.5">
                  Action taken by: <strong className="text-foreground">{item.actionBy}</strong>
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
