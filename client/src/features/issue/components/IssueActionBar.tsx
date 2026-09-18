import { ArrowUpRight, CheckCircle2, Eye, HelpCircle, Save, Loader2 } from "lucide-react"
import { IssueStatus } from "../types/issue.types"

interface IssueActionBarProps {
  currentStatus: IssueStatus
  onSaveProgress: () => void
  onMarkUnderReview: () => void
  onRequestInfo: () => void
  onEscalate: () => void
  onResolve: () => void
  isSubmitting?: boolean
  canManage?: boolean
}

export default function IssueActionBar({
  currentStatus,
  onSaveProgress,
  onMarkUnderReview,
  onRequestInfo,
  onEscalate,
  onResolve,
  isSubmitting = false,
  canManage = true,
}: IssueActionBarProps) {
  const isResolvedOrClosed =
    currentStatus === IssueStatus.RESOLVED || currentStatus === IssueStatus.CLOSED

  if (isResolvedOrClosed) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>This issue is {currentStatus.toLowerCase()}. No further actions required.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-xl flex flex-wrap items-center justify-between gap-3 sticky bottom-4 z-30 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onSaveProgress}
          disabled={isSubmitting}
          className="px-4 py-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5 text-muted-foreground" />
          <span>SAVE PROGRESS</span>
        </button>

        {canManage && currentStatus === IssueStatus.OPEN && (
          <button
            type="button"
            onClick={onMarkUnderReview}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>MARK UNDER REVIEW</span>
          </button>
        )}

        <button
          type="button"
          onClick={onRequestInfo}
          disabled={isSubmitting}
          className="px-4 py-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
          <span>REQUEST INFO</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {currentStatus !== IssueStatus.ESCALATED && (
          <button
            type="button"
            onClick={onEscalate}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-red-500/30 bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
            <span>ESCALATE</span>
          </button>
        )}

        {canManage && (
          <button
            type="button"
            onClick={onResolve}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>RESOLVE ISSUE</span>
          </button>
        )}
      </div>
    </div>
  )
}
