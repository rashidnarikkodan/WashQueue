import { useState, useEffect, useMemo } from "react"
import { ExternalLink, Phone, Printer, ShieldAlert, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import type { IssueDto } from "../types/issue.types"
import { IssueStatus, IssuePriority } from "../types/issue.types"

interface CaseSummaryCardProps {
  issue: IssueDto
  bookingUrl: string
  onContactCustomer?: () => void
  onPrintReport?: () => void
}

export default function CaseSummaryCard({
  issue,
  bookingUrl,
  onContactCustomer,
  onPrintReport,
}: CaseSummaryCardProps) {
  const [elapsedStr, setElapsedStr] = useState("0h 0m")
  const [slaRemainingMinutes, setSlaRemainingMinutes] = useState(0)

  // Target SLA hours per priority
  const targetSlaHours = useMemo(() => {
    switch (issue.priority) {
      case IssuePriority.CRITICAL:
        return 12
      case IssuePriority.HIGH:
        return 24
      case IssuePriority.LOW:
        return 72
      case IssuePriority.MEDIUM:
      default:
        return 48
    }
  }, [issue.priority])

  useEffect(() => {
    const calcDuration = () => {
      const createdMs = new Date(issue.createdAt).getTime()
      const nowMs = Date.now()
      const diffMs = Math.max(0, nowMs - createdMs)
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const days = Math.floor(hours / 24)
      const remHours = hours % 24

      if (days > 0) {
        setElapsedStr(`${days}d ${remHours}h`)
      } else {
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        setElapsedStr(`${hours}h ${mins}m`)
      }

      const totalTargetMs = targetSlaHours * 60 * 60 * 1000
      const remainingMs = totalTargetMs - diffMs
      setSlaRemainingMinutes(Math.floor(remainingMs / (1000 * 60)))
    }

    calcDuration()
    const interval = setInterval(calcDuration, 60000)
    return () => clearInterval(interval)
  }, [issue.createdAt, targetSlaHours])

  const isResolvedOrClosed =
    issue.status === IssueStatus.RESOLVED || issue.status === IssueStatus.CLOSED

  const normStatus = (issue.status || IssueStatus.OPEN).replace("_", " ")

  const isSlaBreached = slaRemainingMinutes < 0
  const slaProgressPercent = Math.min(
    100,
    Math.max(
      0,
      Math.floor(
        ((targetSlaHours * 60 - Math.max(0, slaRemainingMinutes)) / (targetSlaHours * 60)) * 100
      )
    )
  )

  const formatSlaRemaining = () => {
    if (isSlaBreached) {
      const breachedHours = Math.floor(Math.abs(slaRemainingMinutes) / 60)
      const breachedMins = Math.abs(slaRemainingMinutes) % 60
      return `BREACHED BY ${breachedHours}h ${breachedMins}m`
    }
    const remHours = Math.floor(slaRemainingMinutes / 60)
    const remMins = slaRemainingMinutes % 60
    return `${remHours}h ${remMins}m remaining`
  }

  const handleCallCustomer = () => {
    if (issue.customerDetails?.phone) {
      window.location.href = `tel:${issue.customerDetails.phone.replace(/\s+/g, "")}`
    } else if (onContactCustomer) {
      onContactCustomer()
    }
  }

  return (
    <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-6 text-left">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <ShieldAlert className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">Case Summary</h3>
      </div>

      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Current Status</span>
          <span className="font-bold text-foreground capitalize">{normStatus}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Category</span>
          <span className="font-bold text-foreground">{issue.category || "Vehicle Damage"}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Priority</span>
          <span
            className={`font-black uppercase tracking-wider ${
              issue.priority === IssuePriority.CRITICAL
                ? "text-red-400"
                : issue.priority === IssuePriority.HIGH
                  ? "text-orange-400"
                  : "text-amber-400"
            }`}
          >
            {issue.priority || "Medium"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Open Since</span>
          <span className="font-bold text-foreground">{elapsedStr}</span>
        </div>

        {/* SLA Timer */}
        {!isResolvedOrClosed && (
          <div className="pt-2 space-y-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                SLA TARGET ({targetSlaHours}h)
              </span>
              <span
                className={`font-mono font-bold text-xs ${
                  isSlaBreached ? "text-red-400" : "text-amber-400"
                }`}
              >
                {formatSlaRemaining()}
              </span>
            </div>

            <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden border border-border/40">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSlaBreached
                    ? "bg-red-500"
                    : slaProgressPercent > 80
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                }`}
                style={{ width: `${slaProgressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Links */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <Link
          to={bookingUrl}
          className="w-full p-3 rounded-xl bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-between transition-colors border border-border/40"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-primary" />
            <span>View Full Booking Details</span>
          </div>
          <span className="text-muted-foreground">→</span>
        </Link>

        {issue.customerDetails?.phone && (
          <button
            type="button"
            onClick={handleCallCustomer}
            className="w-full p-3 rounded-xl bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-between transition-colors border border-border/40 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call Customer ({issue.customerDetails.phone})</span>
            </div>
            <span className="text-muted-foreground">→</span>
          </button>
        )}

        <button
          type="button"
          onClick={onPrintReport || (() => window.print())}
          className="w-full p-3 rounded-xl bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-between transition-colors border border-border/40 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Case Report</span>
          </div>
          <span className="text-muted-foreground">→</span>
        </button>
      </div>
    </div>
  )
}
