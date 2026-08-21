import { useNavigate } from "react-router-dom"
import {
  CheckCircle2,
  XCircle,
  Ticket,
  Car,
  Clock,
  Calendar,
  MapPin,
  ArrowRight,
  RotateCcw,
  Home,
  ShieldAlert,
  AlertTriangle,
  RotateCcw as RefreshIcon,
} from "lucide-react"

interface BookingResultModalProps {
  isOpen: boolean
  type: "success" | "error"
  bookingNumber?: string
  bookingId?: string
  stationName?: string
  vehicleName?: string
  scheduledDate?: string
  scheduledTime?: string
  totalPrice?: number
  errorMessage?: string
  onClose: () => void
  onRetryPayment?: () => void
}

export default function BookingResultModal({
  isOpen,
  type,
  bookingNumber = "WQ-20481",
  bookingId,
  stationName = "WashQueue Station",
  vehicleName,
  scheduledDate,
  scheduledTime,
  totalPrice,
  errorMessage = "The payment transaction was cancelled or declined. No charges were made.",
  onClose,
  onRetryPayment,
}: BookingResultModalProps) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const isSuccess = type === "success"

  const isSlotUnavailable =
    !isSuccess &&
    (errorMessage === "SLOT_UNAVAILABLE" ||
      errorMessage?.includes("SLOT_UNAVAILABLE") ||
      errorMessage?.toLowerCase().includes("slot is no longer available") ||
      errorMessage?.toLowerCase().includes("time window is no longer available") ||
      errorMessage?.toLowerCase().includes("full"))

  const isRefundInitiated =
    !isSuccess &&
    (errorMessage === "RESERVATION_EXPIRED_REFUND_INITIATED" ||
      errorMessage?.includes("RESERVATION_EXPIRED_REFUND_INITIATED") ||
      errorMessage?.toLowerCase().includes("refund"))

  const displayErrorMessage = isSlotUnavailable
    ? "This time slot just filled up or is no longer available. Please choose another time slot."
    : isRefundInitiated
    ? "Your payment succeeded, but the 10-minute hold window expired before confirmation. A full refund has been automatically initiated to your account."
    : errorMessage || "The payment transaction was cancelled or declined. No charges were made."

  const handleViewDetails = () => {
    onClose()
    if (bookingId) {
      navigate(`/bookings/${bookingId}`)
    } else {
      navigate("/bookings")
    }
  }

  const handleGoHome = () => {
    onClose()
    navigate("/")
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Glow Effect Backdrop */}
      <div
        className={`absolute w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none -z-10 ${
          isSuccess
            ? "bg-emerald-500"
            : isSlotUnavailable
            ? "bg-amber-500"
            : isRefundInitiated
            ? "bg-primary"
            : "bg-destructive"
        }`}
      />

      {/* Main Full-Screen Modal Card */}
      <div
        className={`w-full max-w-lg rounded-[32px] p-6 sm:p-10 border shadow-2xl text-center space-y-6 relative overflow-hidden bg-card text-card-foreground animate-in zoom-in-95 duration-200 ${
          isSuccess
            ? "border-emerald-500/30 shadow-emerald-950/20"
            : isSlotUnavailable
            ? "border-amber-500/30 shadow-amber-950/20"
            : isRefundInitiated
            ? "border-primary/30 shadow-primary/20"
            : "border-destructive/30 shadow-destructive/20"
        }`}
      >
        {/* Animated Badge Icon Header */}
        <div className="flex justify-center pt-2">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all animate-pulse shadow-lg ${
              isSuccess
                ? "bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-500 ring-8 ring-emerald-500/10 shadow-emerald-500/20"
                : isSlotUnavailable
                ? "bg-amber-500/15 border-2 border-amber-500/40 text-amber-500 ring-8 ring-amber-500/10 shadow-amber-500/20"
                : isRefundInitiated
                ? "bg-primary/15 border-2 border-primary/40 text-primary ring-8 ring-primary/10 shadow-primary/20"
                : "bg-destructive/15 border-2 border-destructive/40 text-destructive ring-8 ring-destructive/10 shadow-destructive/20"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 size={44} className="text-emerald-500 stroke-[2.5]" />
            ) : isSlotUnavailable ? (
              <Clock size={44} className="text-amber-500 stroke-[2.5]" />
            ) : isRefundInitiated ? (
              <RefreshIcon size={44} className="text-primary stroke-[2.5]" />
            ) : (
              <XCircle size={44} className="text-destructive stroke-[2.5]" />
            )}
          </div>
        </div>

        {/* Title & Booking ID Pill */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-sans">
            {isSuccess
              ? "Payment Successful"
              : isSlotUnavailable
              ? "Slot Unavailable"
              : isRefundInitiated
              ? "Refund Initiated"
              : "Payment Failed"}
          </h2>

          <div className="flex items-center justify-center">
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider ${
                isSuccess
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : isSlotUnavailable
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                  : isRefundInitiated
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}
            >
              {isSuccess ? (
                <>
                  <Ticket size={14} className="text-primary" />
                  <span>BOOKING ID: {bookingNumber}</span>
                </>
              ) : isSlotUnavailable ? (
                <>
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span>SLOT NO LONGER AVAILABLE</span>
                </>
              ) : isRefundInitiated ? (
                <>
                  <RefreshIcon size={14} className="text-primary" />
                  <span>AUTO REFUND PROCESSING</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={14} className="text-destructive" />
                  <span>TRANSACTION CANCELLED</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Details Card Summary */}
        <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3 text-left text-xs text-foreground">
          {isSuccess ? (
            <>
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                    Station
                  </span>
                  <p className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-primary shrink-0" />
                    <span className="truncate">{stationName}</span>
                  </p>
                </div>
                {vehicleName && (
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Vehicle
                    </span>
                    <p className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                      <Car size={12} className="text-primary shrink-0" />
                      <span className="truncate">{vehicleName}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {scheduledTime && (
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Time Window
                    </span>
                    <p className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                      <Clock size={12} className="text-primary shrink-0" />
                      <span className="truncate">{scheduledTime}</span>
                    </p>
                    {scheduledDate && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar size={10} className="text-muted-foreground/70 shrink-0" />
                        <span className="truncate">{scheduledDate}</span>
                      </p>
                    )}
                  </div>
                )}
                {totalPrice !== undefined && (
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Amount Paid
                    </span>
                    <p className="font-bold text-emerald-500 text-sm mt-0.5 font-sans">
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                {isSlotUnavailable
                  ? "Availability Notice"
                  : isRefundInitiated
                  ? "Refund Notice"
                  : "Failure Reason"}
              </span>
              <p className="text-foreground leading-relaxed text-xs">{displayErrorMessage}</p>
            </div>
          )}
        </div>

        {/* Action Buttons for Next Move */}
        <div className="space-y-2.5 pt-2">
          {isSuccess ? (
            <>
              <button
                type="button"
                onClick={handleViewDetails}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-primary-foreground font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <span>View Booking Details &amp; QR Pass</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={handleGoHome}
                className="w-full py-3 px-6 rounded-2xl bg-card hover:bg-muted border border-border text-foreground font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Home size={14} />
                <span>Back to Home</span>
              </button>
            </>
          ) : isSlotUnavailable ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/20 hover:opacity-90"
              >
                <Calendar size={16} />
                <span>Choose Another Time Slot</span>
              </button>
            </>
          ) : (
            <>
              {onRetryPayment && !isRefundInitiated && (
                <button
                  type="button"
                  onClick={onRetryPayment}
                  className="w-full py-3.5 px-6 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/20 hover:opacity-90"
                >
                  <RotateCcw size={16} />
                  <span>Try Payment Again</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <span>Cancel &amp; Return to Booking</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
