import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  QrCode,
  PlusCircle,
  Keyboard,
  CheckCircle2,
  HelpCircle,
  Camera,
  Focus,
  Zap,
  ArrowRight,
  User,
  Car,
  Clock,
  Sparkles,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { bookingApi } from "@/shared/apis/booking.api"
import type { BookingResponse } from "@/shared/apis/booking.api"

export default function ManagerCheckInPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"CHECK_IN" | "WALK_IN">("CHECK_IN")
  const [bookingIdInput, setBookingIdInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResponse | null>(null)

  // Handle Manual Check-In
  const handleManualCheckIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!bookingIdInput.trim()) {
      toast.error("Please enter a Booking ID or QR Token")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await bookingApi.checkIn(bookingIdInput.trim())
      toast.success("Customer checked in successfully!")
      setConfirmedBooking(res)
      setBookingIdInput("")
    } catch (err: any) {
      console.error("Check-in error:", err)
      toast.error(err?.message || "Failed to check in. Please verify Booking ID.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 sm:p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
      
      {/* 1. Page Header */}
      <div className="space-y-2 border-b border-slate-800/80 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-100 tracking-tight">
          Customer Arrival Desk
        </h1>
        <p className="text-sm sm:text-base text-slate-400 font-medium">
          Manage customer arrivals, booking check-ins, and walk-in bookings.
        </p>
      </div>

      {/* 2. Tab Navigation Pills */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab("CHECK_IN")}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === "CHECK_IN"
              ? "bg-blue-500/10 text-blue-400 border-2 border-blue-500/40 shadow-lg shadow-blue-500/10"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <QrCode className="h-4 w-4 text-blue-400" />
          <span>[ Check-In ]</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("WALK_IN")
            navigate("/manager/walk-ins")
          }}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === "WALK_IN"
              ? "bg-blue-500/10 text-blue-400 border-2 border-blue-500/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <PlusCircle className="h-4 w-4 text-slate-400" />
          <span>[ Walk-In Booking ]</span>
        </button>
      </div>

      {/* 3. Check-In Operational Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Left Card: Digital Check-In / QR Scanner */}
        <div className="rounded-3xl bg-[#191F31] border border-white/5 p-6 sm:p-8 space-y-8 relative overflow-hidden flex flex-col justify-between shadow-2xl">
          
          {/* Subtle background glow */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black tracking-widest uppercase text-blue-400">
                DIGITAL CHECK-IN
              </span>
              <p className="text-xs text-slate-400">
                Align the customer's QR pass within the camera viewfinder to auto check-in.
              </p>
            </div>

            {/* QR Scanner Viewfinder Simulation Box */}
            <div className="relative aspect-square max-w-[320px] mx-auto rounded-2xl border-2 border-slate-700 bg-black overflow-hidden flex flex-col items-center justify-center p-6 group">
              
              {/* Corner Target Markers */}
              <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />

              {/* Animated Scanning Line */}
              <div className="absolute inset-x-2 top-1/2 h-0.5 bg-blue-400 shadow-[0_0_15px_#60A5FA] animate-pulse" />

              {/* Scanner Icon & Instructions */}
              <QrCode className="h-28 w-28 text-slate-700 group-hover:text-blue-500/60 transition-colors" />
              <p className="text-xs font-medium text-slate-400 text-center mt-4 px-2">
                Place customer QR code in front of camera
              </p>
            </div>
          </div>

          {/* Bottom Status Indicators */}
          <div className="grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-6 text-center">
            
            <div className="flex flex-col items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#4AE176]" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Camera className="h-3 w-3" /> CAMERA
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#4AE176]" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Focus className="h-3 w-3" /> FOCUS
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#4AE176]" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Zap className="h-3 w-3" /> SCANNER
              </span>
            </div>

          </div>

        </div>

        {/* Right Card: Manual Check-In */}
        <div className="rounded-3xl bg-[#23293C] border border-white/5 p-6 sm:p-8 space-y-8 flex flex-col justify-between shadow-2xl">
          
          <form onSubmit={handleManualCheckIn} className="space-y-6">
            
            <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
              <Keyboard className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Manual Check-In</h2>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-300">
                BOOKING ID
              </label>

              <input
                type="text"
                value={bookingIdInput}
                onChange={(e) => setBookingIdInput(e.target.value)}
                placeholder="e.g. WQ-8829-XJ"
                className="w-full px-6 py-4 rounded-xl bg-[#2E3447] text-white font-mono text-lg font-bold placeholder:text-slate-500 border border-slate-700 focus:outline-none focus:border-blue-400 transition-colors shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#ADC6FF] hover:bg-blue-300 text-[#002E6A] font-extrabold text-base transition-all shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>{isSubmitting ? "Processing..." : "Check-In"}</span>
            </button>

          </form>

          {/* Quick Help Accordion */}
          <div className="space-y-3 border-t border-slate-700/60 pt-6">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              QUICK HELP
            </span>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p>
                  If scanner fails, enter the 8-digit Booking ID found in the customer's confirmation email.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <HelpCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p>
                  Check-in is only available within 30 mins of the scheduled slot.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Confirmed Booking Modal */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Checked-In Successfully</h3>
                  <p className="text-xs text-slate-400">
                    Booking #{confirmedBooking.bookingNumber}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setConfirmedBooking(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <User className="h-4 w-4 text-blue-400" /> Customer:
                </span>
                <span className="font-bold text-white">
                  {confirmedBooking.customerDetails?.name || confirmedBooking.walkInCustomer?.name || "Customer"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-blue-400" /> Vehicle:
                </span>
                <span className="font-bold text-white">
                  {confirmedBooking.vehicleDetails?.brand || ""} {confirmedBooking.vehicleDetails?.model || "Vehicle"} ({confirmedBooking.vehicleDetails?.registrationNumber || ""})
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-400" /> Package:
                </span>
                <span className="font-bold text-blue-300">
                  {confirmedBooking.serviceType} WASH
                </span>
              </div>

            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setConfirmedBooking(null)
                  navigate("/manager/queues")
                }}
                className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View Queue Board</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => setConfirmedBooking(null)}
                className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
