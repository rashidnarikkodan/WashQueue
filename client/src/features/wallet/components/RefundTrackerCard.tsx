import React from "react"
import { RotateCcw, Clock } from "lucide-react"

interface RefundTrackerCardProps {
  totalRefundAmount: number
}

export const RefundTrackerCard: React.FC<RefundTrackerCardProps> = ({ totalRefundAmount }) => {
  return (
    <div className="flex flex-col justify-between gap-4">
      <div className="rounded-2xl bg-card p-5 border border-border flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground">Total Refunded</h3>
            <p className="text-lg font-bold text-foreground">₹{totalRefundAmount.toFixed(2)}</p>
          </div>
        </div>
        <span className="text-xs text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-md">
          Instant Credit
        </span>
      </div>

      <div className="rounded-2xl bg-card p-5 border border-border space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              REFUND TRACKER
            </span>
            <p className="text-sm font-bold text-foreground">Booking Cancellation Refunds</p>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Auto-Processed
          </span>
        </div>

        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-3/4 rounded-full" />
        </div>

        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          Cancelled booking refunds are automatically credited back to your wallet instantly.
        </p>
      </div>
    </div>
  )
}

export default RefundTrackerCard
