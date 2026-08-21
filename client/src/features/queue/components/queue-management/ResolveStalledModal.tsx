import { X } from "lucide-react"

type ResolveTargetStatus = "CHECKED_IN" | "IN_SERVICE" | "CANCELLED"

interface ResolveStalledModalProps {
  isOpen: boolean
  resolutionInput: string
  targetStatusInput: ResolveTargetStatus
  isAdvancing: boolean
  onResolutionInputChange: (value: string) => void
  onTargetStatusChange: (value: ResolveTargetStatus) => void
  onConfirm: () => void
  onClose: () => void
}

export function ResolveStalledModal({
  isOpen,
  resolutionInput,
  targetStatusInput,
  isAdvancing,
  onResolutionInputChange,
  onTargetStatusChange,
  onConfirm,
  onClose,
}: ResolveStalledModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-amber-500/40 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-xl font-bold text-amber-500">Resolve Stalled Issue</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              RECOVERY TARGET ACTION
            </label>
            <select
              value={targetStatusInput}
              onChange={(e) => onTargetStatusChange(e.target.value as ResolveTargetStatus)}
              className="w-full px-4 py-3 rounded-2xl bg-muted border border-border text-foreground font-bold text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="CHECKED_IN">Re-enter Waiting Queue (CHECKED_IN)</option>
              <option value="IN_SERVICE">Resume Wash Service (IN_SERVICE)</option>
              <option value="CANCELLED">Cancel Booking &amp; Process Refund</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              RESOLUTION NOTES
            </label>
            <textarea
              value={resolutionInput}
              onChange={(e) => onResolutionInputChange(e.target.value)}
              placeholder="Enter resolution notes..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <button
            onClick={onConfirm}
            disabled={isAdvancing || !resolutionInput.trim()}
            className="w-full py-3.5 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            {isAdvancing ? "Resolving..." : "Complete Recovery Action"}
          </button>
        </div>
      </div>
    </div>
  )
}
