import { useState, useEffect } from "react"
import { ExternalLink, Phone, Printer, ShieldAlert } from "lucide-react"
import { Link } from "react-router-dom"
import type { IssueDto } from "../types/issue.types"
import { IssueStatus } from "../types/issue.types"

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
  // SLA calculation
  const [elapsedStr, setElapsedStr] = useState("0h 0m")

  useEffect(() => {
    const calcDuration = () => {
      const createdMs = new Date(issue.createdAt).getTime()
      const diffMs = Math.max(0, Date.now() - createdMs)
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const days = Math.floor(hours / 24)
      const remHours = hours % 24

      if (days > 0) {
        setElapsedStr(`${days}d ${remHours}h`)
      } else {
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        setElapsedStr(`${hours}h ${mins}m`)
      }
    }

    calcDuration()
    const interval = setInterval(calcDuration, 60000)
    return () => clearInterval(interval)
  }, [issue.createdAt])

  const isResolvedOrClosed =
    issue.status === IssueStatus.RESOLVED || issue.status === IssueStatus.CLOSED

  const normStatus = (issue.status || IssueStatus.OPEN).replace("_", " ")

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
          <span className="text-muted-foreground font-medium">Priority</span>
          <span
            className={`font-black uppercase ${
              issue.priority === "CRITICAL"
                ? "text-red-400"
                : issue.priority === "HIGH"
                  ? "text-orange-400"
                  : "text-amber-400"
            }`}
          >
            {issue.priority || "Critical"}
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
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                SLA TIMER
              </span>
              <span className="font-mono font-bold text-amber-400 text-xs">03:42:12</span>
            </div>

            <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden border border-border/40">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-500"
                style={{ width: "72%" }}
              />
            </div>

            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block text-right">
              RESOLUTION TARGET IN 3.8 HOURS
            </span>
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

        <button
          type="button"
          onClick={onContactCustomer}
          className="w-full p-3 rounded-xl bg-muted/40 hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-between transition-colors border border-border/40 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Contact Customer</span>
          </div>
          <span className="text-muted-foreground">→</span>
        </button>

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
