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
          isSuccess ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      {/* Main Full-Screen Modal Card */}
      <div
        className={`w-full max-w-lg rounded-[32px] p-6 sm:p-10 border shadow-2xl text-center space-y-6 relative overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200 ${
          isSuccess
            ? "bg-[#0d121f]/95 border-emerald-500/30 shadow-emerald-950/40"
            : "bg-[#0d121f]/95 border-red-500/30 shadow-red-950/40"
        }`}
      >
        {/* Animated Badge Icon Header */}
        <div className="flex justify-center pt-2">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all animate-pulse shadow-lg ${
              isSuccess
                ? "bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 ring-8 ring-emerald-500/10 shadow-emerald-500/20"
                : "bg-red-500/15 border-2 border-red-500/40 text-red-400 ring-8 ring-red-500/10 shadow-red-500/20"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 size={44} className="text-emerald-400 stroke-[2.5]" />
            ) : (
              <XCircle size={44} className="text-red-400 stroke-[2.5]" />
            )}
          </div>
        </div>

        {/* Title & Booking ID Pill */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            {isSuccess ? "Payment Successful" : "Payment Failed"}
          </h2>

          <div className="flex items-center justify-center">
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider ${
                isSuccess
                  ? "bg-slate-800/90 border-slate-700/80 text-blue-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              {isSuccess ? (
                <>
                  <Ticket size={14} className="text-blue-400" />
                  <span>BOOKING ID: {bookingNumber}</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={14} className="text-red-400" />
                  <span>TRANSACTION CANCELLED</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Details Card Summary */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3 text-left text-xs text-slate-300">
          {isSuccess ? (
            <>
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Station</span>
                  <p className="font-bold text-slate-100 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-blue-400 shrink-0" />
                    <span className="truncate">{stationName}</span>
                  </p>
                </div>
                {vehicleName && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Vehicle</span>
                    <p className="font-bold text-slate-100 flex items-center gap-1 mt-0.5">
                      <Car size={12} className="text-blue-400 shrink-0" />
                      <span className="truncate">{vehicleName}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {scheduledTime && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Time Window</span>
                    <p className="font-bold text-slate-100 flex items-center gap-1 mt-0.5">
                      <Clock size={12} className="text-blue-400 shrink-0" />
                      <span className="truncate">{scheduledTime}</span>
                    </p>
                    {scheduledDate && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} className="text-slate-500 shrink-0" />
                        <span className="truncate">{scheduledDate}</span>
                      </p>
                    )}
                  </div>
                )}
                {totalPrice !== undefined && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Amount Paid</span>
                    <p className="font-bold text-emerald-400 text-sm mt-0.5">
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Failure Reason</span>
              <p className="text-slate-300 leading-relaxed text-xs">{errorMessage}</p>
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
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <span>View Booking Details &amp; QR Pass</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={handleGoHome}
                className="w-full py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home size={14} />
                <span>Back to Home</span>
              </button>
            </>
          ) : (
            <>
              {onRetryPayment && (
                <button
                  type="button"
                  onClick={onRetryPayment}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  <RotateCcw size={16} />
                  <span>Try Payment Again</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
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
