import React from "react"
import { CreditCard, AlertCircle, X } from "lucide-react"

interface TopUpModalProps {
  isOpen: boolean
  onClose: () => void
  topUpAmount: number
  onAmountChange: (amount: number) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  topUpAmount,
  onAmountChange,
  onSubmit,
  isSubmitting,
}) => {
  if (!isOpen) return null

  const presetAmounts = [500, 1000, 2000, 5000]

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border text-card-foreground rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Add Funds to Wallet</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Enter Amount (INR)
          </label>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
              ₹
            </span>
            <input
              type="number"
              min="1"
              value={topUpAmount}
              onChange={(e) => onAmountChange(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-2xl font-black text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="500"
            />
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => onAmountChange(amt)}
                className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  topUpAmount === amt
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-foreground border-border hover:bg-muted/70"
                }`}
              >
                +₹{amt}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-muted/60 border border-border rounded-xl p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <span>
            Funds will be immediately credited to your WashQueue wallet upon successful Razorpay payment.
          </span>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-bold text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{isSubmitting ? "Processing..." : `Proceed to Pay ₹${topUpAmount}`}</span>
        </button>
      </div>
    </div>
  )
}

export default TopUpModal
