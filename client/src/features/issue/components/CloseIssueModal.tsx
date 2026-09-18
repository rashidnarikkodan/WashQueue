import { useState } from "react"
import { CheckCircle2, X, Loader2 } from "lucide-react"

interface CloseIssueModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmClose: (notes: string) => Promise<void>
  isSubmitting?: boolean
  issueId: string
}

export default function CloseIssueModal({
  isOpen,
  onClose,
  onConfirmClose,
  isSubmitting = false,
  issueId,
}: CloseIssueModalProps) {
  const [notes, setNotes] = useState("")

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onConfirmClose(notes)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-7 space-y-5 text-left animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Close Support Ticket</h3>
              <p className="text-xs text-muted-foreground font-mono">Reference #{issueId}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed">
            Closing this ticket confirms that the reported concern has been resolved or addressed.
            You can reopen or submit a new inquiry if needed later.
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Closing Remarks / Satisfaction Feedback (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Provide feedback on the resolution or additional notes..."
              className="w-full p-3 rounded-xl bg-muted/40 text-foreground text-xs border border-border focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Closing...</span>
                </>
              ) : (
                <span>Confirm & Close Ticket</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
