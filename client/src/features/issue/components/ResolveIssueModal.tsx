import { useState, useRef, useEffect } from "react"
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { ResolutionType, type ResolveIssuePayload } from "../types/issue.types"

interface ResolveIssueModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmResolve: (payload: ResolveIssuePayload) => Promise<void>
  isSubmitting?: boolean
  bookingNumber?: string
}

export default function ResolveIssueModal({
  isOpen,
  onClose,
  onConfirmResolve,
  isSubmitting = false,
  bookingNumber,
}: ResolveIssueModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const [resolutionType, setResolutionType] = useState<ResolutionType>(ResolutionType.REFUND)
  const [compensationAmount, setCompensationAmount] = useState<number>(0)
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

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
    if (resolutionNotes.trim().length < 5) {
      setError("Please provide resolution notes (at least 5 characters).")
      return
    }

    setError(null)
    await onConfirmResolve({
      resolutionType,
      compensationAmount: Number(compensationAmount) || 0,
      resolutionNotes: resolutionNotes.trim(),
    })
  }

  const showCompensation =
    resolutionType === ResolutionType.REFUND ||
    resolutionType === ResolutionType.PARTIAL_REFUND ||
    resolutionType === ResolutionType.DISCOUNT_COUPON

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
            <h3 className="text-lg font-bold text-foreground">Resolve Issue Case</h3>
            {bookingNumber && (
              <p className="text-xs text-muted-foreground font-mono">
                For booking #{bookingNumber}
              </p>
            )}
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

      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Resolution Type <span className="text-red-400">*</span>
          </label>
          <select
            value={resolutionType}
            onChange={(e) => setResolutionType(e.target.value as ResolutionType)}
            className="w-full px-4 py-2.5 rounded-xl bg-muted/40 text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all"
          >
            <option value={ResolutionType.REFUND}>Full Refund</option>
            <option value={ResolutionType.PARTIAL_REFUND}>Partial Refund / Credit</option>
            <option value={ResolutionType.SERVICE_REDO}>Complimentary Wash / Redo</option>
            <option value={ResolutionType.DISCOUNT_COUPON}>Discount Voucher</option>
            <option value={ResolutionType.APOLOGY}>Apology / Clarification</option>
            <option value={ResolutionType.DISMISSED}>Dismissed / Invalid Claim</option>
            <option value={ResolutionType.OTHER}>Other Settlement</option>
          </select>
        </div>

        {showCompensation && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Compensation / Refund Amount (₹)
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={compensationAmount}
              onChange={(e) => setCompensationAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/40 text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Resolution Notes &amp; Outcome <span className="text-red-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Explain the settlement decision, compensation breakdown, or action taken..."
            className="w-full px-4 py-3 rounded-xl bg-muted/40 text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all resize-none placeholder:text-muted-foreground leading-relaxed"
          />
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
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
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? "Processing..." : "Confirm Resolution"}</span>
          </button>
        </div>
      </form>
    </dialog>
  )
}
