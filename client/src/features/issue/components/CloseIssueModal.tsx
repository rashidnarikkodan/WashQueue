import { useState, useRef, useEffect } from "react"
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
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [notes, setNotes] = useState("")

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
    await onConfirmClose(notes.trim())
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
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Close Support Ticket</h3>
            <p className="text-xs text-muted-foreground font-mono">Reference #{issueId}</p>
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
        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed">
          Closing this ticket confirms that the reported concern has been resolved or addressed. You
          can reopen or submit a new inquiry if needed later.
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Closing Remarks / Satisfaction Feedback (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Provide feedback on the resolution or additional notes..."
            className="w-full px-4 py-3 rounded-xl bg-muted/40 text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground resize-none leading-relaxed"
          />
        </div>

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
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
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
    </dialog>
  )
}
