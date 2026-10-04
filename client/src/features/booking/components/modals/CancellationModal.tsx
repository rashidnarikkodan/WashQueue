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
  const [nowMs] = useState(() => Date.now())

  if (!isOpen || !booking) return null

  const totalAmount =
    booking?.pricingSnapshot?.totalPrice ??
    booking?.totalPrice ??
    booking?.totalAmount ??
    booking?.amount ??
    450

  const rawWindowStart = booking.scheduling?.windowStart || booking.windowStart
  const windowStartMs = rawWindowStart ? new Date(rawWindowStart).getTime() : null
  const diffMs = windowStartMs !== null ? windowStartMs - nowMs : null
  const hoursRemaining = diffMs !== null ? diffMs / (1000 * 60 * 60) : null

  let policyTier: "FULL_REFUND" | "PARTIAL_REFUND" | "NO_REFUND"
  let refundPercentage: number
  let deductionLabel: string
  let policyTitle: string
  let policyExplanation: string

  if (hoursRemaining !== null) {
    let timeRemainingFormatted: string
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

  const stationName = booking.stationDetails?.name || booking.stationName || "Wash Station"
  const vehicleName = booking.vehicleDetails?.brand
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
    <div
      className="
      fixed inset-0 z-50
      flex items-center justify-center
      bg-black/80 backdrop-blur-md
      p-3 sm:p-5 lg:p-8
      overflow-y-hidden
      overscroll-contain
    "
    >
      {!isSuccess ? (
        <div
          className="
          relative
          flex w-full max-w-3xl
          max-h-[calc(100dvh-1.5rem)]
          sm:max-h-[calc(100dvh-2.5rem)]
          lg:max-h-[calc(100dvh-4rem)]
          flex-col
          overflow-hidden
          rounded-2xl sm:rounded-3xl
          border border-border
          bg-card text-card-foreground
          shadow-2xl
          animate-in zoom-in-95
        "
        >
          {/* HEADER */}
          <div
            className="
            relative shrink-0
            border-b border-border
            bg-card
            px-5 py-5
            sm:px-7 sm:py-6
          "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close cancellation modal"
              className="
              absolute right-4 top-4
              sm:right-6 sm:top-6
              flex h-9 w-9 items-center justify-center
              rounded-full
              text-muted-foreground
              transition-colors
              hover:bg-muted hover:text-foreground
              disabled:pointer-events-none
              disabled:opacity-50
              cursor-pointer
            "
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4 pr-10">
              <div
                className="
                flex h-12 w-12 shrink-0
                items-center justify-center
                rounded-full
                border border-destructive/20
                bg-destructive/15
                sm:h-14 sm:w-14
              "
              >
                <AlertTriangle className="h-6 w-6 text-destructive sm:h-7 sm:w-7" />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                  Cancel Booking?
                </h1>

                <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Review the cancellation details and refund amount before continuing.
                </p>
              </div>
            </div>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div
            className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            px-4 py-5
            sm:px-6 sm:py-6
            lg:px-7
          "
          >
            <div className="space-y-5">
              {/* BOOKING SUMMARY */}
              <section
                className="
                rounded-2xl
                border border-border
                bg-muted/40
                p-4 sm:p-5
              "
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div
                    className="
                    h-24 w-full
                    shrink-0
                    overflow-hidden
                    rounded-xl
                    border border-border
                    bg-muted
                    sm:h-24 sm:w-32
                  "
                  >
                    <img
                      src="https://images.unsplash.com/photo-1617788138017-80ad40651399?w=300&auto=format&fit=crop"
                      alt="Vehicle"
                      className="h-full w-full object-cover opacity-80"
                    />
                  </div>

                  <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-5 gap-y-4">
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Station
                      </span>

                      <span className="mt-1 block truncate text-sm font-semibold text-foreground sm:text-base">
                        {stationName}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Vehicle
                      </span>

                      <span className="mt-1 block truncate text-sm font-semibold text-foreground sm:text-base">
                        {vehicleName}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Service
                      </span>

                      <span className="mt-1 block truncate text-sm font-semibold text-foreground sm:text-base">
                        {serviceName}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Time
                      </span>

                      <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-foreground sm:text-base">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{formattedSlotTime}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* REFUND */}
              <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Refund Breakdown
                  </span>

                  <span
                    className={`
                    rounded-full border px-2.5 py-1
                    text-[10px] font-extrabold uppercase
                    ${
                      policyTier === "FULL_REFUND"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                        : policyTier === "PARTIAL_REFUND"
                          ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                          : "border-destructive/20 bg-destructive/10 text-destructive"
                    }
                  `}
                  >
                    {refundPercentage}% Refund
                  </span>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <div className="space-y-3.5 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Service Amount</span>

                      <span className="shrink-0 text-base font-medium text-foreground">
                        ₹{totalAmount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">{deductionLabel}</span>

                      <span
                        className={`shrink-0 font-medium ${
                          nonRefundableAmount > 0 ? "text-destructive" : "text-emerald-500"
                        }`}
                      >
                        {nonRefundableAmount > 0 ? `- ₹${nonRefundableAmount}` : "₹0 (Free)"}
                      </span>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <span className="block text-base font-semibold text-foreground">
                            Total Refund
                          </span>

                          <span className="text-[11px] text-muted-foreground">
                            Credited to your wallet
                          </span>
                        </div>

                        <span className="shrink-0 text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
                          ₹{refundAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* POLICY */}
              <section
                className="
                flex items-start gap-3
                rounded-2xl
                border border-primary/20
                bg-primary/5
                p-4
              "
              >
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                <div className="min-w-0 space-y-1">
                  <h4 className="text-sm font-bold text-foreground">{policyTitle}</h4>

                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {policyExplanation}
                  </p>
                </div>
              </section>

              {/* REASON */}
              <section className="space-y-3">
                <span className="block px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Reason for Cancellation
                </span>

                <div className="flex flex-wrap gap-2">
                  {CANCELLATION_REASONS.map((reason) => {
                    const isSelected = selectedReason === reason

                    return (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setSelectedReason(reason)}
                        className={`
                        rounded-full border
                        px-3.5 py-2
                        text-xs font-medium
                        transition-all
                        sm:text-sm
                        cursor-pointer
                        ${
                          isSelected
                            ? "border-primary/40 bg-primary/15 font-semibold text-primary"
                            : "border-border bg-muted text-foreground hover:bg-muted/80"
                        }
                      `}
                      >
                        {reason}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* WARNING */}
              <section
                className="
                flex items-start gap-3
                rounded-2xl
                border border-destructive/20
                bg-destructive/10
                p-4
              "
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

                <p className="text-xs font-medium leading-relaxed text-destructive sm:text-sm">
                  Once cancelled, your queue position will be lost and cannot be restored. Other
                  customers may take your slot immediately.
                </p>
              </section>
            </div>
          </div>

          {/* FOOTER */}
          <div
            className="
            shrink-0
            border-t border-border
            bg-muted/40
            p-4
            sm:p-5 sm:px-6
            lg:px-7
          "
          >
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="
                w-full rounded-xl
                border border-border
                bg-card
                px-6 py-3
                text-sm font-semibold text-foreground
                transition-colors
                hover:bg-muted
                disabled:pointer-events-none
                disabled:opacity-50
                sm:w-auto
              "
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="
                flex w-full items-center justify-center gap-2
                rounded-xl
                bg-destructive
                px-6 py-3
                text-sm font-bold text-destructive-foreground
                shadow-lg shadow-destructive/20
                transition-opacity
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:w-auto
              "
              >
                <Trash2 className="h-4 w-4" />

                <span>{isSubmitting ? "Cancelling..." : "Confirm Cancellation"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-card text-card-foreground border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 my-8 relative p-8 sm:p-12 flex flex-col items-center text-center space-y-8">
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

          <div className="space-y-3 max-w-lg">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              Your booking has been cancelled successfully.
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              We’ve updated our schedule. Your reservation slot has been released back into the
              queue.
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
                        Full refund of <strong className="text-emerald-500">₹{refundAmount}</strong>{" "}
                        (100% refund for cancelling &gt;24h in advance) is credited back to your
                        wallet instantly.
                      </>
                    ) : (
                      <>
                        50% partial refund of{" "}
                        <strong className="text-emerald-500">₹{refundAmount}</strong> (₹
                        {nonRefundableAmount} fee retained for cancelling 2–24h prior) is credited
                        back to your wallet instantly.
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
            <span>
              ISSUED:{" "}
              {new Date()
                .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                .toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
