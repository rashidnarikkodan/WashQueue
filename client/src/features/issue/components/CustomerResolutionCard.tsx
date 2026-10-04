import { CheckCircle2, DollarSign, FileText, Sparkles } from "lucide-react"
import type { IssueDto } from "../types/issue.types"
import { IssueStatus } from "../types/issue.types"

interface CustomerResolutionCardProps {
  issue: IssueDto
  onCloseTicket?: () => void
  onEscalateTicket?: () => void
  isSubmitting?: boolean
}

export default function CustomerResolutionCard({
  issue,
  onCloseTicket,
  onEscalateTicket,
  isSubmitting = false,
}: CustomerResolutionCardProps) {
  const isResolved = issue.status === IssueStatus.RESOLVED
  const isClosed = issue.status === IssueStatus.CLOSED

  if (!isResolved && !isClosed) {
    return (
      <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 shadow-xl space-y-3 text-left">
        <div className="flex items-center gap-2.5 text-blue-400">
          <Sparkles className="w-5 h-5 shrink-0" />
          <h3 className="text-base font-bold text-foreground">
            Under Review by Station Management
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your ticket has been received by the station manager and support team. We inspect pre &
          post service high-definition camera scans and technician logs. You will receive an
          official resolution update here shortly.
        </p>
      </div>
    )
  }

  const formatResolutionType = (type?: string | null) => {
    if (!type) return "Resolved & Handled"
    return type
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ")
  }

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-card border border-emerald-500/30 shadow-xl space-y-5 text-left relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">Official Resolution Summary</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {isClosed ? "CASE CLOSED" : "OFFICIAL RESOLUTION OFFERED"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Resolution Type:{" "}
              <strong className="text-foreground">
                {formatResolutionType(issue.resolutionType)}
              </strong>
            </span>
          </div>
        </div>

        {issue.resolvedAt && (
          <span className="text-xs font-mono text-muted-foreground">
            {new Date(issue.resolvedAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      {/* Resolution Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            COMPENSATION / REFUND AMOUNT
          </span>
          <span className="text-xl font-black text-emerald-400">
            {issue.compensationAmount && issue.compensationAmount > 0
              ? `₹${issue.compensationAmount.toLocaleString()}`
              : "No Direct Surcharge"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-primary" />
            OUTCOME ACTION
          </span>
          <span className="text-sm font-bold text-foreground capitalize">
            {formatResolutionType(issue.resolutionType)}
          </span>
        </div>
      </div>

      {/* Resolution Notes / Explanation */}
      {issue.resolutionNotes && (
        <div className="p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
            STATION MANAGER REMARKS
          </span>
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
            "{issue.resolutionNotes}"
          </p>
        </div>
      )}

      {/* Customer Action Bar if not closed yet */}
      {isResolved && (
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Are you satisfied with this resolution? You can close this ticket or request further
            escalation.
          </p>

          <div className="flex items-center gap-2.5">
            {onEscalateTicket && (
              <button
                type="button"
                onClick={onEscalateTicket}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Escalate to Admin
              </button>
            )}

            {onCloseTicket && (
              <button
                type="button"
                onClick={onCloseTicket}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                Accept & Close Ticket
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
