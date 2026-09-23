import { useState, useRef, useEffect } from "react"
import { X, ArrowUpRight, AlertTriangle, Loader2 } from "lucide-react"
import { ROLE } from "@/shared/constants/role.const"

interface EscalateIssueModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmEscalate: (reason: string) => Promise<void>
  isSubmitting?: boolean
  issueId?: string
  role?: string
}

export default function EscalateIssueModal({
  isOpen,
  onClose,
  onConfirmEscalate,
  isSubmitting = false,
  issueId,
  role,
}: EscalateIssueModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)

  const isManager = role === ROLE.MANAGER
  const targetLabel = isManager ? "Station Owner" : "Platform Admin"

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
        document.body.style.overflow = "hidden"
      }
    } else {
      if (dialog.open) {
        dialog.close()
        document.body.style.overflow = ""
      }
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reason.trim().length < 5) {
      setError("Please provide a reason for escalation (at least 5 characters).")
      return
    }
    setError(null)
    await onConfirmEscalate(reason.trim())
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
      className="fixed inset-0 m-auto bg-card border border-border shadow-2xl rounded-3xl p-0 w-full max-w-lg max-h-[90vh] overflow-hidden backdrop:bg-background/80 backdrop:backdrop-blur-md text-foreground text-left"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Escalate to {targetLabel}</h3>
            {issueId && <p className="text-xs text-muted-foreground font-mono">Case #{issueId}</p>}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isManager
            ? "Escalating this ticket will flag it for Station Owner review and financial settlement authorization."
            : "Escalating this ticket will flag it with highest priority for Central Platform Administrators for final arbitration."}
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Escalation Reason &amp; Summary <span className="text-red-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              isManager
                ? "Explain why this case requires Owner approval (e.g. high compensation claim, customer dispute)..."
                : "Explain why this case requires Central Platform Admin arbitration..."
            }
            className="w-full px-4 py-3 rounded-xl bg-muted/40 text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all resize-none placeholder:text-muted-foreground leading-relaxed"
          />
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUpRight className="w-4 h-4" />
            )}
            <span>{isSubmitting ? "Escalating..." : "Confirm Escalation"}</span>
          </button>
        </div>
      </form>
    </dialog>
  )
}
