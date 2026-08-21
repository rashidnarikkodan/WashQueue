import { X } from "lucide-react"

interface StallBookingModalProps {
  isOpen: boolean
  reasonInput: string
  isAdvancing: boolean
  onReasonInputChange: (value: string) => void
  onConfirm: () => void
  onClose: () => void
}

export function StallBookingModal({
  isOpen,
  reasonInput,
  isAdvancing,
  onReasonInputChange,
  onConfirm,
  onClose,
}: StallBookingModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-destructive/40 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-xl font-bold text-destructive">Stall Booking</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground font-medium">
            Marking a booking as STALLED retains it in the operational queue dashboard while
            indicating an exception (e.g. payment issue, inspection dispute, vehicle problem).
          </p>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              STALL REASON / EXCEPTION DETAILS
            </label>
            <textarea
              value={reasonInput}
              onChange={(e) => onReasonInputChange(e.target.value)}
              placeholder="Describe the operational exception..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-destructive transition-colors resize-none"
            />
          </div>

          <button
            onClick={onConfirm}
            disabled={isAdvancing || !reasonInput.trim()}
            className="w-full py-3.5 rounded-2xl bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            {isAdvancing ? "Stalling..." : "Confirm Move to STALLED"}
          </button>
        </div>
      </div>
    </div>
  )
}
