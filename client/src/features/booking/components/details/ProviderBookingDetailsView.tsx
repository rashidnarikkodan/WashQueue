import { useMemo } from "react"
import {
  Clock,
  XCircle,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ChevronRight,
  Sparkles,
  Lock,
  Camera,
} from "lucide-react"
import type { BookingResponse } from "@/shared/apis/booking.api"
import { toast } from "sonner"

interface ProviderBookingDetailsViewProps {
  booking: BookingResponse
  formattedDates: { dateStr: string; timeStr: string }
  currentStageIndex: number
  onOpenCancelModal: () => void
  onAdvanceStatus: (targetStatus: string) => Promise<void>
  isAdvancingStatus: boolean
}

export default function ProviderBookingDetailsView({
  booking,
  formattedDates,
  onOpenCancelModal,
  onAdvanceStatus,
  isAdvancingStatus,
}: ProviderBookingDetailsViewProps) {
  const customerName = booking.customerDetails?.name || booking.walkInCustomer?.name || "Customer"
  const customerPhone = booking.customerDetails?.phone || booking.walkInCustomer?.phone || "N/A"
  const vehicleName = booking.vehicleDetails?.nickname
    ? booking.vehicleDetails.nickname
    : booking.vehicleDetails?.brand
      ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model || ""}`.trim()
      : "Registered Vehicle"
  const plateNumber =
    booking.vehicleDetails?.registrationNumber || booking.walkInVehicle?.registrationNumber || "N/A"
  const serviceName = booking.serviceType === "FULL" ? "Complete Full Wash" : "Express Half Wash"

  // Execution Timeline Steps derived from real status history logs
  const timelineSteps = useMemo(() => {
    const historyMap = new Map<string, string>()
    if (booking.statusHistory) {
      booking.statusHistory.forEach((log) => {
        const timeStr = new Date(log.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        historyMap.set(log.toStatus, timeStr)
      })
    }

    const stages = [
      { key: "CONFIRMED", label: "Confirmed" },
      { key: "CHECKED_IN", label: "Checked-In" },
      { key: "IN_SERVICE", label: "Washing" },
      { key: "SERVICE_COMPLETED", label: "Ready" },
      { key: "COMPLETED", label: "Completed" },
    ]

    const currentStatus = booking.status
    const order = [
      "PENDING",
      "CONFIRMED",
      "CHECKED_IN",
      "IN_SERVICE",
      "SERVICE_COMPLETED",
      "AWAITING_HANDOVER",
      "COMPLETED",
    ]
    const currentIdx = order.indexOf(currentStatus)

    return stages.map((stg) => {
      const recordedTime = historyMap.get(stg.key)
      const stageIdx = order.indexOf(stg.key)
      const active = currentStatus === stg.key
      const done = recordedTime ? true : currentIdx >= stageIdx && currentIdx !== -1

      return {
        label: stg.label,
        time: recordedTime || (active ? "In Progress" : done ? "Done" : "Pending"),
        done,
        active,
      }
    })
  }, [booking.statusHistory, booking.status])

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span>Bookings</span>
            <ChevronRight size={12} />
            <span className="text-primary font-bold">#{booking.bookingNumber}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Booking Details Overview
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(booking.status === "CONFIRMED" || booking.status === "PENDING") && (
            <button
              type="button"
              onClick={onOpenCancelModal}
              className="px-4 py-2.5 rounded-full border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <XCircle size={14} />
              <span>Cancel Booking</span>
            </button>
          )}

          {booking.status === "CHECKED_IN" && (
            <button
              type="button"
              onClick={() => onAdvanceStatus("IN_SERVICE")}
              disabled={isAdvancingStatus}
              className="px-5 py-2.5 rounded-full bg-primary text-slate-950 font-black text-xs hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-primary/20"
            >
              <Sparkles size={14} />
              <span>Start Washing</span>
            </button>
          )}

          {booking.status === "IN_SERVICE" && (
            <button
              type="button"
              onClick={() => onAdvanceStatus("COMPLETED")}
              disabled={isAdvancingStatus}
              className="px-5 py-2.5 rounded-full bg-emerald-400 text-slate-950 font-black text-xs hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-400/20"
            >
              <CheckCircle2 size={14} />
              <span>Mark Completed</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => toast.info(`Calling ${customerPhone}...`)}
            className="px-4 py-2.5 rounded-full bg-[#23293c] text-foreground hover:bg-slate-800 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Phone size={14} className="text-primary" />
            <span>Contact Customer</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="p-2.5 rounded-full bg-[#23293c] text-foreground hover:bg-slate-800 transition-all cursor-pointer"
            title="Print Summary"
          >
            <Printer size={15} />
          </button>
        </div>
      </div>

      {/* Main 12-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8-Column Main Execution Feed */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Booking Overview Bar (4 KPI Tiles) */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-primary/5 backdrop-blur-md grid grid-cols-1 sm:grid-cols-4 gap-6 text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">
                Booking ID
              </span>
              <span className="text-lg font-mono font-bold text-primary">
                #{booking.bookingNumber}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">
                Current Status
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400" />
                <span className="text-base font-bold text-emerald-400 uppercase">
                  {booking.status.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">
                Queue / ETA
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-foreground">#02</span>
                <span className="text-xs text-muted-foreground font-normal">/ 12 mins</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">
                Service Type
              </span>
              <span className="text-sm font-bold text-foreground block">{serviceName}</span>
              <span className="text-[10px] text-muted-foreground">Four Wheeler</span>
            </div>
          </div>

          {/* 2. Live Execution Timeline (Horizontal Stepper) */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/5 bg-[#151b2d] space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                <h3 className="text-base font-bold text-foreground">Live Execution Timeline</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20 tracking-wider">
                REAL-TIME
              </span>
            </div>

            {/* Stepper Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                      step.active
                        ? "bg-[#151b2d] border-4 border-primary text-primary scale-110 shadow-primary/30"
                        : step.done
                          ? "bg-primary text-slate-950 font-black"
                          : "bg-[#191f31] border border-white/10 text-muted-foreground"
                    }`}
                  >
                    {step.done ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground block">{step.label}</span>
                    <span className="text-[10px] text-muted-foreground block">{step.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Pre-Service Inspection Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/5 bg-[#151b2d] space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-base font-bold text-foreground">Pre-Service Inspection</h3>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                COMPLETED
              </span>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-video rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-muted-foreground p-2 text-center"
                >
                  <Camera size={20} className="text-muted-foreground/40" />
                </div>
              ))}
            </div>

            {/* Damage Notes Box */}
            <div className="p-4 rounded-xl border border-white/10 bg-[#070d1f] space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">
                DAMAGE / ISSUE NOTES
              </span>
              <p className="text-xs italic text-slate-300 leading-relaxed">
                "Minor paint swirl marks observed on the front left fender. Slight curbing on the
                rear right alloy wheel. Interior leather requires focused conditioning on driver
                seat side bolsters."
              </p>
            </div>
          </div>

          {/* 4. Post-Service Inspection (Locked) */}
          <div className="p-8 rounded-3xl border border-dashed border-white/20 bg-[#151b2d]/60 opacity-60 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#191f31] flex items-center justify-center mx-auto text-muted-foreground">
              <Lock size={20} />
            </div>
            <h3 className="text-base font-bold text-foreground">Post-Service Inspection</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              This section will unlock automatically once the "Washing" and "Drying" phases are
              marked as completed by the technician.
            </p>
          </div>

          {/* 5. Exception Handling Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/5 bg-[#151b2d] space-y-4 text-left">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle size={20} />
              <h3 className="text-base font-bold text-foreground">Exception Handling</h3>
            </div>

            <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 space-y-1">
              <h4 className="text-sm font-bold text-amber-300">
                Delays detected in high-pressure wash bay #2.
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The current service phase is exceeding the estimated time by 8 minutes. Potential
                bottleneck identified in water reclamation pump.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={() => toast.warning("Delay report submitted to station log.")}
                className="flex-1 py-3 rounded-2xl border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                REPORT DELAY
              </button>
              <button
                type="button"
                onClick={() => toast.error("Escalated to Station Operations Manager.")}
                className="flex-1 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
              >
                ESCALATE
              </button>
            </div>
          </div>
        </div>

        {/* Right 4-Column Sticky Aside Management Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* A. Customer & Vehicle Card */}
          <div className="p-6 rounded-3xl border border-white/5 bg-[#191f31] shadow-2xl space-y-6 text-left">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary text-slate-950 font-black text-xl flex items-center justify-center shrink-0">
                RN
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-foreground">{customerName}</h4>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                    ELITE MEMBER
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{customerPhone}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-[#070d1f] space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-muted-foreground block">
                    VEHICLE
                  </span>
                  <h5 className="text-sm font-bold text-foreground">{vehicleName}</h5>
                  <p className="text-[11px] text-muted-foreground">2022 VX | Crystal Black Pearl</p>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#2e3447] text-foreground font-bold border border-white/10">
                  {plateNumber}
                </span>
              </div>
            </div>
          </div>

          {/* B. Booking Schedule & Timer Card */}
          <div className="p-6 rounded-3xl border border-white/5 bg-[#191f31] shadow-2xl space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase text-muted-foreground block">
                  SCHEDULED AT
                </span>
                <span className="text-xs font-bold text-foreground block">
                  {formattedDates.dateStr}
                </span>
                <span className="text-[11px] text-muted-foreground">{formattedDates.timeStr}</span>
              </div>

              <div className="space-y-0.5 text-right">
                <span className="text-[9px] font-black uppercase text-muted-foreground block">
                  EXECUTION TYPE
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                  STATION
                </span>
              </div>
            </div>

            {/* Timer Counter Display */}
            <div className="p-5 rounded-2xl border border-primary/20 bg-[#070d1f] text-center space-y-1">
              <span className="text-[9px] font-black uppercase text-muted-foreground block tracking-widest">
                ELAPSED EXECUTION TIME
              </span>
              <div className="flex items-center justify-center gap-2 text-red-400 font-mono text-3xl font-bold">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                <span>00:34:18</span>
              </div>
            </div>
          </div>

          {/* C. Financial Summary Card */}
          <div className="p-6 rounded-3xl border border-white/5 bg-[#191f31] shadow-2xl space-y-4 text-left">
            <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest border-b border-white/5 pb-3">
              FINANCIAL SUMMARY
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Base Service Fee</span>
                <span className="font-bold text-foreground">
                  ₹{booking.pricingSnapshot.basePrice || 499}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Interior Deep Cleaning (Add-on)</span>
                <span className="font-bold text-foreground">
                  ₹{booking.pricingSnapshot.extraPrice || 299}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes &amp; Platform Fees</span>
                <span className="font-bold text-foreground">₹58</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <div>
                  <span className="text-[9px] font-black uppercase text-muted-foreground block">
                    NET EARNINGS
                  </span>
                  <span className="text-2xl font-extrabold text-foreground">
                    ₹{booking.pricingSnapshot.totalPrice || 856}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-slate-950">
                  PAID
                </span>
              </div>
            </div>
          </div>

          {/* D. Quick Management Action Buttons */}
          <div className="p-6 rounded-3xl border border-white/5 bg-[#191f31] shadow-2xl space-y-3">
            {booking.status === "IN_SERVICE" && (
              <button
                type="button"
                onClick={() => onAdvanceStatus("COMPLETED")}
                disabled={isAdvancingStatus}
                className="w-full py-4 rounded-2xl bg-primary text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20"
              >
                MARK SERVICE COMPLETE
              </button>
            )}

            <button
              type="button"
              onClick={() => onAdvanceStatus("AWAITING_HANDOVER")}
              disabled={isAdvancingStatus || booking.status !== "COMPLETED"}
              className="w-full py-4 rounded-2xl bg-[#2e3447] text-muted-foreground text-xs font-black uppercase tracking-wider hover:text-foreground transition-all cursor-pointer"
            >
              INITIATE HANDOVER
            </button>

            <button
              type="button"
              onClick={() => onAdvanceStatus("NO_SHOW")}
              disabled={isAdvancingStatus}
              className="w-full py-3 rounded-2xl border border-red-500/40 text-red-400/80 hover:text-red-400 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              MARK NO-SHOW
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
