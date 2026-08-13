import { useState } from "react"
import { AlertTriangle, Trash2, CheckCircle2, DollarSign, X } from "lucide-react"

interface CancellationModalProps {
  booking: any
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

export function CancellationModal({
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

  // Pricing calculations
  const totalAmount = booking?.pricingSnapshot?.totalPrice || booking?.totalAmount || booking?.totalPrice || 450
  const cancellationFee = totalAmount > 0 ? 50 : 0
  const refundAmount = Math.max(0, totalAmount - cancellationFee)

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
        /* ================= 1. CONFIRMATION MODAL STATE ================= */
        <div className="w-full max-w-[672px] bg-[#191F31] text-[#DCE1FB] border border-[#8C909F]/10 rounded-[24px] shadow-2xl backdrop-blur-xl overflow-hidden animate-in zoom-in-95 my-8">
          {/* Top Warning Header */}
          <div className="flex flex-col items-center gap-2 p-8 pb-4 relative">
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-[#C2C6D6] hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="w-20 h-20 rounded-full bg-[#93000A]/30 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-[#FFB4AB]" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#DCE1FB] text-center tracking-tight pt-2">
              Cancel Booking?
            </h1>

            <p className="text-[#C2C6D6] text-sm sm:text-base text-center max-w-[448px] leading-relaxed">
              This action may affect your queue position and refund eligibility. This cannot be undone.
            </p>
          </div>

          {/* Scrollable Content Area */}
          <div className="p-6 sm:p-8 pt-0 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Booking Summary Bento Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#151B2D] border border-white/5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#2E3447] flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1617788138017-80ad40651399?w=300&auto=format&fit=crop"
                  alt="Vehicle"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 flex-1 text-xs sm:text-sm w-full">
                <div>
                  <span className="text-[11px] font-bold text-[#005321] tracking-widest uppercase block">
                    STATION
                  </span>
                  <span className="font-semibold text-[#DCE1FB] text-sm sm:text-base">
                    {booking.stationDetails?.name || booking.stationName || "LuxeWash Terminal 4"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#005321] tracking-widest uppercase block">
                    VEHICLE
                  </span>
                  <span className="font-semibold text-[#DCE1FB] text-sm sm:text-base">
                    {booking.vehicleDetails?.brand || "Vehicle"} {booking.vehicleDetails?.model || booking.vehicleModel || ""}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#005321] tracking-widest uppercase block">
                    SERVICE
                  </span>
                  <span className="font-semibold text-[#DCE1FB] text-sm sm:text-base">
                    {booking.serviceType || "Standard"} Wash
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#005321] tracking-widest uppercase block">
                    TIME
                  </span>
                  <span className="font-semibold text-[#DCE1FB] text-sm sm:text-base">
                    {booking.scheduling?.windowStart
                      ? new Date(booking.scheduling.windowStart).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : booking.slotTime || "11:15 AM"}
                  </span>
                </div>
              </div>
            </div>

            {/* Refund Breakdown Section */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#C2C6D6] uppercase tracking-wider block px-1">
                REFUND BREAKDOWN
              </span>

              <div className="p-6 rounded-2xl bg-[#070D1F] border border-[#424754]/10 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#C2C6D6]">Service Amount</span>
                  <span className="font-medium text-[#DCE1FB] text-base">₹{totalAmount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#C2C6D6]">Cancellation Fee</span>
                  <span className="font-medium text-[#FFB4AB]">- ₹{cancellationFee}</span>
                </div>

                <div className="pt-3 border-t border-[#424754]/20 flex items-center justify-between">
                  <span className="font-semibold text-[#DCE1FB] text-base">Total Refund Amount</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#ADC6FF] tracking-tight">
                    ₹{refundAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Reason Pills */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#C2C6D6] uppercase tracking-wider block px-1">
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
                          ? "bg-[#ADC6FF]/10 text-[#ADC6FF] border-[#ADC6FF]/30 font-semibold"
                          : "bg-[#2E3447] text-[#DCE1FB] border-white/5 hover:bg-[#2E3447]/80"
                      }`}
                    >
                      {reason}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Warning Notice Box */}
            <div className="p-4 rounded-2xl bg-[#93000A]/10 border border-[#FFB4AB]/20 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#FFB4AB] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#FFB4AB] leading-relaxed font-medium">
                Once cancelled, your queue position will be lost and cannot be restored. Other customers may take your slot immediately.
              </p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-6 sm:p-8 bg-[#191F31]/60 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#3E495D] text-[#DCE1FB] font-semibold text-base hover:bg-[#3E495D]/80 transition-all cursor-pointer text-center"
            >
              Keep Booking
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#93000A] text-[#FFDAD6] font-bold text-base hover:opacity-90 transition-all shadow-[0_0_20px_rgba(147,0,10,0.40)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isSubmitting ? "Cancelling..." : "Confirm Cancellation"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* ================= 2. SUCCESSFUL CANCELLATION MODAL STATE ================= */
        <div className="w-full max-w-[672px] bg-[#191F31] text-[#DCE1FB] rounded-[24px] shadow-[0_0_50px_rgba(74,225,118,0.10)] overflow-hidden animate-in zoom-in-95 my-8 relative p-8 sm:p-12 flex flex-col items-center text-center space-y-8">
          {/* Asymmetric Background Accents */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#4AE176]/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#ADC6FF]/5 blur-3xl pointer-events-none" />

          {/* Success Visual & Status Badge */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-[#00A74B]/20 flex items-center justify-center p-2">
              <div className="w-full h-full rounded-full bg-[#4AE176]/10 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-[#4AE176]" />
              </div>
            </div>

            <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-[#FFB4AB] bg-[#93000A]/20 border border-[#FFB4AB]/10">
              CANCELLED
            </span>
          </div>

          {/* Hero Headline & Subtext */}
          <div className="space-y-3 max-w-[512px]">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#DCE1FB] tracking-tight leading-tight">
              Your booking has been cancelled successfully.
            </h1>

            <p className="text-[#C2C6D6] text-base sm:text-lg leading-relaxed">
              We’ve updated our schedule. Your reservation slot has been released back into the queue.
            </p>
          </div>

          {/* Refund Information Card (Editorial Sunken Feel) */}
          <div className="w-full max-w-[544px] p-6 sm:p-8 rounded-2xl bg-[#070D1F] border border-white/5 flex items-center gap-5 text-left">
            <div className="w-12 h-12 rounded-xl bg-[#4AE176]/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-6 w-6 text-[#4AE176]" />
            </div>

            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-semibold text-[#DCE1FB]">Refund Processing</h3>
              <p className="text-sm text-[#C2C6D6] leading-relaxed">
                Refund of <strong className="text-[#4AE176]">₹{refundAmount}</strong> will be processed within 3–5 business days to your original payment method / wallet.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-[544px] flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onBookAgain || onClose}
              className="w-full sm:w-1/2 py-4 rounded-xl bg-[#ADC6FF] text-[#002E6A] font-semibold text-base hover:opacity-90 transition-all shadow-[0_10px_15px_-3px_rgba(173,198,255,0.10)] cursor-pointer text-center"
            >
              Book Again
            </button>

            <button
              type="button"
              onClick={onBackToHome || onClose}
              className="w-full sm:w-1/2 py-4 rounded-xl bg-[#3E495D] text-[#AEB9D0] font-semibold text-base hover:bg-[#3E495D]/80 transition-all cursor-pointer text-center"
            >
              Back to Home
            </button>
          </div>

          {/* Footer Metadata */}
          <div className="w-full max-w-[544px] pt-6 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-[#8C909F] uppercase tracking-widest">
            <span>TRANSACTION ID: {booking.bookingNumber || "WQ-9823-X1"}</span>
            <span>ISSUED: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
