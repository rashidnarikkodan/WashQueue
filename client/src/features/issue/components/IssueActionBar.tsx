import { ArrowUpRight, CheckCircle2, Eye, Save, Loader2, UserCheck } from "lucide-react"
import { IssueStatus } from "../types/issue.types"
import { ROLE } from "@/shared/constants/role.const"

interface IssueActionBarProps {
  currentStatus: IssueStatus
  onSaveProgress: () => void
  onMarkUnderReview: () => void
  onAssignManager?: () => void
  onEscalate: () => void
  onResolve: () => void
  onCloseTicket?: () => void
  isSubmitting?: boolean
  canManage?: boolean
  isCustomer?: boolean
  role?: string
}

export default function IssueActionBar({
  currentStatus,
  onSaveProgress,
  onMarkUnderReview,
  onAssignManager,
  onEscalate,
  onResolve,
  onCloseTicket,
  isSubmitting = false,
  canManage = true,
  isCustomer = false,
  role,
}: IssueActionBarProps) {
  const isResolved = currentStatus === IssueStatus.RESOLVED
  const isClosed = currentStatus === IssueStatus.CLOSED

  const isManager = role === ROLE.MANAGER
  const isOwner = role === ROLE.OWNER
  const isAdmin = role === ROLE.ADMIN

  if (isClosed) {
    return (
      <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-xl flex items-center justify-between text-muted-foreground font-bold text-xs sticky bottom-4 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>This issue case is closed. All actions are archived.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-xl flex flex-wrap items-center justify-between gap-3 sticky bottom-4 z-30 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {canManage && !isResolved && (
          <button
            type="button"
            onClick={onSaveProgress}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-muted-foreground" />
            <span>SAVE NOTES</span>
          </button>
        )}

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

        {canManage && onAssignManager && (
          <button
            type="button"
            onClick={onAssignManager}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-primary" />
            <span>ASSIGN MANAGER</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Tiered escalation button: Managers escalate to Owner, Owners escalate to Admin */}
        {!isAdmin && !isCustomer && currentStatus !== IssueStatus.ESCALATED && (
          <button
            type="button"
            onClick={onEscalate}
            disabled={isSubmitting}
            className="px-4 sm:px-5 py-2.5 rounded-xl border border-red-500/30 bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
            <span>
              {isManager ? "ESCALATE TO OWNER" : isOwner ? "ESCALATE TO ADMIN" : "ESCALATE"}
            </span>
          </button>
        )}

        {canManage && !isResolved && (
          <button
            type="button"
            onClick={onResolve}
            disabled={isSubmitting}
            className="px-5 sm:px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>RESOLVE ISSUE</span>
          </button>
        )}

        {onCloseTicket && (
          <button
            type="button"
            onClick={onCloseTicket}
            disabled={isSubmitting}
            className="px-5 sm:px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isCustomer ? "ACCEPT & CLOSE TICKET" : "CLOSE TICKET"}</span>
          </button>
        )}
      </div>
    </div>
  )
}
