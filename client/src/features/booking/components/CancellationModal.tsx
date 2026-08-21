import { useState } from "react"
import { AlertTriangle, Trash2, CheckCircle2, DollarSign, X, Info, Clock } from "lucide-react"

export interface CancellableBooking {
  id?: string
  bookingNumber?: string
  serviceType?: string
  pricingSnapshot?: { totalPrice?: number }
  totalAmount?: number
  totalPrice?: number
  amount?: number
  scheduling?: { windowStart?: string; windowEnd?: string }
  windowStart?: string
  slotDate?: string
  slotTime?: string
  stationDetails?: { name?: string }
  stationName?: string
  vehicleDetails?: { brand?: string; model?: string }
  vehicleNumber?: string
  vehicleType?: string
  vehicleModel?: string
  paymentStatus?: string
  paymentMethod?: string
}

interface CancellationModalProps {
  booking: CancellableBooking
  isOpen: boolean
  onClose: () => void
  onConfirmCancel: (reason: string) => Promise<void>
  onBookAgain?: () => void
  onBackToHome?: () => void
}

const CANCELLATION_REASONS = [
  "Change of plans",
  "Long wait time",
  "Booked by mistake",
  "Station issue",
  "Other",
]

export default function CancellationModal({
  booking,
  isOpen,
  onClose,
  onConfirmCancel,
  onBookAgain,
  onBackToHome,
}: CancellationModalProps) {
  const [selectedReason, setSelectedReason] = useState("Booked by mistake")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen || !booking) return null

  const totalAmount =
    booking?.pricingSnapshot?.totalPrice ??
    booking?.totalPrice ??
    booking?.totalAmount ??
    booking?.amount ??
    450

  const rawWindowStart = booking.scheduling?.windowStart || booking.windowStart
  const windowStartMs = rawWindowStart ? new Date(rawWindowStart).getTime() : null
  const nowMs = Date.now()
  const diffMs = windowStartMs !== null ? windowStartMs - nowMs : null
  const hoursRemaining = diffMs !== null ? diffMs / (1000 * 60 * 60) : null

  let policyTier: "FULL_REFUND" | "PARTIAL_REFUND" | "NO_REFUND" = "FULL_REFUND"
  let refundPercentage = 100
  let deductionLabel = "Cancellation Fee"
  let policyTitle = "Full Refund Eligible"
  let policyExplanation = ""
  let timeRemainingFormatted = ""

  if (hoursRemaining !== null) {
    if (hoursRemaining <= 0) {
      timeRemainingFormatted = "slot commenced"
    } else if (hoursRemaining < 1) {
      const mins = Math.max(1, Math.round(hoursRemaining * 60))
      timeRemainingFormatted = `~${mins} min before slot`
    } else {
      const hrs = Math.round(hoursRemaining * 10) / 10
      timeRemainingFormatted = `~${hrs} hrs before slot`
    }

    if (hoursRemaining >= 24) {
      policyTier = "FULL_REFUND"
      refundPercentage = 100
      deductionLabel = "Cancellation Fee (> 24h prior)"
      policyTitle = "100% Full Refund Policy (>24h in advance)"
      policyExplanation = `Your wash is scheduled in ${timeRemainingFormatted}. Because you are cancelling more than 24 hours in advance, you receive a 100% full refund with ₹0 cancellation charges.`
    } else if (hoursRemaining >= 2) {
      policyTier = "PARTIAL_REFUND"
      refundPercentage = 50
      deductionLabel = "50% Cancellation Fee (2h–24h window)"
      policyTitle = "50% Cancellation Policy (2h–24h before slot)"
      policyExplanation = `Your wash is scheduled in ${timeRemainingFormatted}. Under our policy, cancellations between 2 and 24 hours before the slot retain a 50% fee (₹${Math.round(
        totalAmount * 0.5
      )}) to compensate for reserved bay capacity. The remaining 50% (₹${Math.round(
        totalAmount * 0.5
      )}) is credited to your wallet.`
    } else {
      policyTier = "NO_REFUND"
      refundPercentage = 0
      deductionLabel = "100% Late Cancellation Penalty (< 2h window)"
      policyTitle = "Late Cancellation Policy (<2h before slot)"
      policyExplanation = `Your wash is scheduled in ${timeRemainingFormatted}. Cancellations made less than 2 hours before the slot are non-refundable as the service bay and staff have already been committed.`
    }
  } else {
    policyTier = "FULL_REFUND"
    refundPercentage = 100
    deductionLabel = "Cancellation Fee"
    policyTitle = "Full Refund Policy"
    policyExplanation =
      "You will receive a full refund credited directly to your wallet balance upon cancellation."
  }

  const refundAmount = Math.round((totalAmount * refundPercentage) / 100)
  const nonRefundableAmount = totalAmount - refundAmount

  const stationName =
    booking.stationDetails?.name || booking.stationName || "Wash Station"
  const vehicleName =
    booking.vehicleDetails?.brand
      ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model || ""}`.trim()
      : booking.vehicleType || booking.vehicleModel || "Vehicle"
  const serviceName = booking.serviceType ? `${booking.serviceType} Wash` : "Wash Service"
  const formattedSlotTime =
    booking.slotTime ||
    (rawWindowStart
      ? new Date(rawWindowStart).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Scheduled Slot")

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true)
      await onConfirmCancel(selectedReason)
      setIsSuccess(true)
    } catch (err) {
      console.error("Cancellation error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {!isSuccess ? (
        <div className="w-full max-w-[672px] bg-card text-card-foreground border border-border rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in zoom-in-95 my-8">
          <div className="flex flex-col items-center gap-2 p-8 pb-4 relative">
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="w-20 h-20 rounded-full bg-destructive/15 flex items-center justify-center border border-destructive/20">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground text-center tracking-tight pt-2">
              Cancel Booking?
            </h1>

            <p className="text-muted-foreground text-sm sm:text-base text-center max-w-[448px] leading-relaxed">
              This action may affect your queue position and refund eligibility. This cannot be undone.
            </p>
          </div>

          <div className="p-6 sm:p-8 pt-0 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="p-5 sm:p-6 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                <img
                  src="https://images.unsplash.com/photo-1617788138017-80ad40651399?w=300&auto=format&fit=crop"
                  alt="Vehicle"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 flex-1 text-xs sm:text-sm w-full">
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase block">
                    STATION
                  </span>
                  <span className="font-semibold text-foreground text-sm sm:text-base">
                    {stationName}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase block">
                    VEHICLE
                  </span>
                  <span className="font-semibold text-foreground text-sm sm:text-base">
                    {vehicleName}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase block">
                    SERVICE
                  </span>
                  <span className="font-semibold text-foreground text-sm sm:text-base">
                    {serviceName}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase block">
                    TIME
                  </span>
                  <span className="font-semibold text-foreground text-sm sm:text-base flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{formattedSlotTime}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  REFUND BREAKDOWN
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    policyTier === "FULL_REFUND"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : policyTier === "PARTIAL_REFUND"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}
                >
                  {refundPercentage}% Refund ({policyTier.replace("_", " ")})
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-3.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Service Amount</span>
                  <span className="font-medium text-foreground text-base">₹{totalAmount}</span>
                </div>

                {nonRefundableAmount > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{deductionLabel}</span>
                    <span className="font-medium text-destructive">- ₹{nonRefundableAmount}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{deductionLabel}</span>
                    <span className="font-medium text-emerald-500">₹0 (Free Cancellation)</span>
                  </div>
                )}

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground text-base block">
                      Total Refund Amount
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Credited directly to your wallet
                    </span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight font-sans">
                    ₹{refundAmount}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3.5 text-left">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-foreground text-xs sm:text-sm">
                  {policyTitle}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {policyExplanation}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block px-1">
                REASON FOR CANCELLATION
              </span>

              <div className="flex flex-wrap gap-2.5">
                {CANCELLATION_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedReason(reason)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border cursor-pointer ${
                        isSelected
                          ? "bg-primary/15 text-primary border-primary/40 font-semibold"
                          : "bg-muted text-foreground border-border hover:bg-muted/80"
                      }`}
                    >
                      {reason}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive leading-relaxed font-medium">
                Once cancelled, your queue position will be lost and cannot be restored. Other customers may take your slot immediately.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-muted/40 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-card border border-border text-foreground font-semibold text-base hover:bg-muted transition-all cursor-pointer text-center"
            >
              Keep Booking
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-destructive text-destructive-foreground font-bold text-base hover:opacity-90 transition-all shadow-lg shadow-destructive/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isSubmitting ? "Cancelling..." : "Confirm Cancellation"}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[672px] bg-card text-card-foreground border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 my-8 relative p-8 sm:p-12 flex flex-col items-center text-center space-y-8">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center p-2">
              <div className="w-full h-full rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
            </div>

            <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-destructive bg-destructive/10 border border-destructive/20">
              CANCELLED
            </span>
          </div>

          <div className="space-y-3 max-w-[512px]">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              Your booking has been cancelled successfully.
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              We’ve updated our schedule. Your reservation slot has been released back into the queue.
            </p>
          </div>

          <div className="w-full max-w-[544px] p-6 sm:p-8 rounded-2xl bg-muted/40 border border-border flex items-center gap-5 text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </div>

            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {refundAmount > 0 ? "Refund Processing" : "No Refund Due"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {refundAmount > 0 ? (
                  <>
                    {refundPercentage === 100 ? (
                      <>
                        Full refund of <strong className="text-emerald-500">₹{refundAmount}</strong> (100% refund for cancelling &gt;24h in advance) is credited back to your wallet instantly.
                      </>
                    ) : (
                      <>
                        50% partial refund of <strong className="text-emerald-500">₹{refundAmount}</strong> (₹{nonRefundableAmount} fee retained for cancelling 2–24h prior) is credited back to your wallet instantly.
                      </>
                    )}
                  </>
                ) : (
                  "This booking was cancelled less than 2 hours before its scheduled window, so it is non-refundable per our cancellation policy."
                )}
              </p>
            </div>
          </div>

          <div className="w-full max-w-[544px] flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onBookAgain || onClose}
              className="w-full sm:w-1/2 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all shadow-md cursor-pointer text-center"
            >
              Book Again
            </button>

            <button
              type="button"
              onClick={onBackToHome || onClose}
              className="w-full sm:w-1/2 py-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-base transition-all cursor-pointer text-center border border-border"
            >
              Back to Home
            </button>
          </div>

          <div className="w-full max-w-[544px] pt-6 border-t border-border flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            <span>TRANSACTION ID: {booking.bookingNumber || "WQ-9823-X1"}</span>
            <span>ISSUED: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
