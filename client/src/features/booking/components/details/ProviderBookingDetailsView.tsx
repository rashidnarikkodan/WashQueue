import { useMemo, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Clock,
  XCircle,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
  Lock,
  FileText,
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
  const navigate = useNavigate()

  const customerName =
    booking.customerDetails?.name ||
    booking.walkInCustomer?.name ||
    (booking.isWalkIn ? "Walk-In Customer" : "Customer")
  const customerPhone =
    booking.customerDetails?.phone || booking.walkInCustomer?.phone || "N/A"
  const vehicleName = booking.vehicleDetails?.nickname
    ? booking.vehicleDetails.nickname
    : booking.vehicleDetails?.brand
      ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model || ""}`.trim()
      : booking.walkInVehicle?.registrationNumber
        ? `Walk-In (${booking.walkInVehicle.registrationNumber})`
        : "Vehicle"
  const plateNumber =
    booking.vehicleDetails?.registrationNumber || booking.walkInVehicle?.registrationNumber || "N/A"
  const serviceName = booking.serviceType === "FULL" ? "Complete Full Wash" : "Express Half Wash"

  // Initials
  const customerInitials = useMemo(() => {
    if (!customerName) return "CU"
    const parts = customerName.trim().split(" ")
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    return customerName.slice(0, 2).toUpperCase()
  }, [customerName])

  // Badge
  const customerBadge = useMemo(() => {
    if (booking.isWalkIn || booking.walkInCustomer) return "WALK-IN GUEST"
    return "REGISTERED USER"
  }, [booking.isWalkIn, booking.walkInCustomer])

  // Live Timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)

  useEffect(() => {
    const startTimeStr = booking.serviceStartedAt || booking.checkedInAt || booking.createdAt
    if (!startTimeStr) return

    const startTime = new Date(startTimeStr).getTime()

    const updateTimer = () => {
      if (booking.completedAt || booking.status === "COMPLETED") {
        const endTime = booking.completedAt
          ? new Date(booking.completedAt).getTime()
          : new Date(booking.updatedAt).getTime()
        setElapsedSeconds(Math.max(0, Math.floor((endTime - startTime) / 1000)))
        return
      }
      const now = Date.now()
      setElapsedSeconds(Math.max(0, Math.floor((now - startTime) / 1000)))
    }

    const interval = setInterval(updateTimer, 1000)
    void Promise.resolve().then(updateTimer)
    return () => clearInterval(interval)
  }, [
    booking.serviceStartedAt,
    booking.checkedInAt,
    booking.createdAt,
    booking.completedAt,
    booking.status,
    booking.updatedAt,
  ])

  const formattedTimer = useMemo(() => {
    const hrs = Math.floor(elapsedSeconds / 3600)
    const mins = Math.floor((elapsedSeconds % 3600) / 60)
    const secs = elapsedSeconds % 60
    const pad = (n: number) => n.toString().padStart(2, "0")
    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
    return `${pad(mins)}:${pad(secs)}`
  }, [elapsedSeconds])

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

  // Inspection note from status history if exists
  const inspectionLog = useMemo(() => {
    if (!booking.statusHistory) return null
    return booking.statusHistory.find(
      (l) => l.notes && (l.toStatus === "IN_SERVICE" || l.toStatus === "CHECKED_IN")
    )
  }, [booking.statusHistory])

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Booking Details Overview
          </h1>
          <p className="text-xs text-muted-foreground">
            Station bay queue monitoring, customer verification, and live service workflow controls
          </p>
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

          {customerPhone !== "N/A" && (
            <button
              type="button"
              onClick={() => toast.info(`Calling ${customerPhone}...`)}
              className="px-4 py-2.5 rounded-full bg-[#23293c] text-foreground hover:bg-slate-800 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Phone size={14} className="text-primary" />
              <span>Contact Customer</span>
            </button>
          )}

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
                Scheduled Slot
              </span>
              <span className="text-xs font-bold text-foreground block truncate">
                {formattedDates.timeStr}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {formattedDates.dateStr}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">
                Service Type
              </span>
              <span className="text-sm font-bold text-foreground block">{serviceName}</span>
              <span className="text-[10px] text-muted-foreground">
                {booking.vehicleDetails?.brand
                  ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model || ""}`.trim()
                  : booking.walkInVehicle?.registrationNumber
                    ? `Plate: ${booking.walkInVehicle.registrationNumber}`
                    : "Standard Wash"}
              </span>
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
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
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
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                  booking.status === "IN_SERVICE" ||
                  booking.status === "SERVICE_COMPLETED" ||
                  booking.status === "COMPLETED"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {booking.status === "IN_SERVICE" ||
                booking.status === "SERVICE_COMPLETED" ||
                booking.status === "COMPLETED"
                  ? "CONDUCTED"
                  : "PENDING"}
              </span>
            </div>

            {inspectionLog?.notes ? (
              <div className="p-4 rounded-xl border border-white/10 bg-[#070d1f] space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">
                  INSPECTION FINDINGS &amp; NOTES
                </span>
                <p className="text-xs italic text-slate-300 leading-relaxed">
                  "{inspectionLog.notes}"
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-white/10 bg-[#070d1f] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  {booking.status === "IN_SERVICE" || booking.status === "COMPLETED"
                    ? "Vehicle received and checked in at station."
                    : "Pre-service inspection can be logged prior to starting the wash service."}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/manager/bookings/${booking.id}/pre-inspection`)}
                  className="px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <FileText size={14} />
                  <span>{inspectionLog ? "View Inspection" : "Log Pre-Inspection"}</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Post-Service Inspection */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/5 bg-[#151b2d] space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-base font-bold text-foreground">Post-Service Quality Inspection</h3>
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                  booking.status === "COMPLETED" || booking.status === "SERVICE_COMPLETED"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-800 text-slate-400 border border-white/10"
                }`}
              >
                {booking.status === "COMPLETED"
                  ? "COMPLETED"
                  : booking.status === "SERVICE_COMPLETED"
                    ? "READY FOR HANDOVER"
                    : "LOCKED"}
              </span>
            </div>

            {booking.status === "COMPLETED" || booking.status === "SERVICE_COMPLETED" ? (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">
                    ✓ Quality Assurance Passed
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/manager/bookings/${booking.id}/post-inspection`)}
                    className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-xs font-bold hover:bg-muted cursor-pointer"
                  >
                    View Post-Inspection
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-white/10 bg-[#070d1f] text-xs text-muted-foreground flex items-center gap-3">
                <Lock size={16} className="shrink-0 text-muted-foreground/60" />
                <span>
                  Post-service quality check unlocks once washing is completed by the manager or technician.
                </span>
              </div>
            )}
          </div>

          {/* 5. Exception Handling / Log Details (Rendered if Cancellation or Status Log Notes exist) */}
          {(booking.status === "CANCELLED" || booking.cancellation || (booking.statusHistory && booking.statusHistory.some(l => l.reason || l.notes))) && (
            <div className="p-6 sm:p-8 rounded-3xl border border-white/5 bg-[#151b2d] space-y-4 text-left">
              <div className="flex items-center gap-2 text-amber-400 border-b border-white/5 pb-3">
                <AlertTriangle size={20} />
                <h3 className="text-base font-bold text-foreground">Status Log &amp; Exceptions</h3>
              </div>

              {booking.status === "CANCELLED" && (
                <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 space-y-1">
                  <h4 className="text-sm font-bold text-red-400">Booking Cancelled</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Reason: {booking.cancellation?.cancellationReason || "No cancellation reason provided."}
                  </p>
                  {booking.cancellation?.cancelledAt && (
                    <span className="text-[10px] text-muted-foreground font-mono block pt-1">
                      Cancelled at {new Date(booking.cancellation.cancelledAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {booking.statusHistory && booking.statusHistory.filter(l => l.reason || l.notes).length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">
                    Recorded Log Notes
                  </span>
                  {booking.statusHistory.filter(l => l.reason || l.notes).map((log) => (
                    <div key={log.id} className="p-3 rounded-xl border border-white/5 bg-[#070d1f] text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                        <span className="font-bold text-foreground">Status: {log.toStatus.replace("_", " ")}</span>
                        <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      {log.reason && <p className="text-amber-300 font-medium">{log.reason}</p>}
                      {log.notes && <p className="text-muted-foreground italic">{log.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 4-Column Sticky Aside Management Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* A. Customer & Vehicle Card */}
          <div className="p-6 rounded-3xl border border-white/5 bg-[#191f31] shadow-2xl space-y-6 text-left">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary text-slate-950 font-black text-xl flex items-center justify-center shrink-0">
                {customerInitials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-foreground">{customerName}</h4>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                    {customerBadge}
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
                  <p className="text-[11px] text-muted-foreground">
                    {booking.vehicleDetails?.brand
                      ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model || ""}`.trim()
                      : booking.walkInVehicle?.registrationNumber
                        ? `Walk-In Entry`
                        : "Vehicle Information"}
                  </p>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#2e3447] text-foreground font-bold border border-white/10">
                  {plateNumber}
                </span>
              </div>
            </div>
          </div>

          {/* B. Booking Schedule & Live Execution Timer Card */}
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

            {/* Live Timer Counter Display */}
            <div className="p-5 rounded-2xl border border-primary/20 bg-[#070d1f] text-center space-y-1">
              <span className="text-[9px] font-black uppercase text-muted-foreground block tracking-widest">
                {booking.completedAt || booking.status === "COMPLETED"
                  ? "TOTAL DURATION"
                  : "ELAPSED EXECUTION TIME"}
              </span>
              <div className="flex items-center justify-center gap-2 text-primary font-mono text-3xl font-bold">
                {booking.status === "IN_SERVICE" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
                <span>{formattedTimer}</span>
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
                <span>Base Service Fee ({serviceName})</span>
                <span className="font-bold text-foreground">
                  ₹{(booking.pricingSnapshot?.basePrice ?? 0).toLocaleString("en-IN")}
                </span>
              </div>

              {booking.extraServices && booking.extraServices.length > 0 ? (
                booking.extraServices.map((es, idx) => (
                  <div key={idx} className="flex justify-between text-muted-foreground">
                    <span>{es.name}</span>
                    <span className="font-bold text-foreground">
                      +₹{es.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-muted-foreground">
                  <span>Extra Add-ons</span>
                  <span className="font-bold text-foreground">₹0</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <div>
                  <span className="text-[9px] font-black uppercase text-muted-foreground block">
                    TOTAL AMOUNT
                  </span>
                  <span className="text-2xl font-extrabold text-foreground font-sans">
                    ₹{(booking.pricingSnapshot?.totalPrice ?? 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {booking.paymentStatus}
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

            {booking.status === "CHECKED_IN" && (
              <button
                type="button"
                onClick={() => onAdvanceStatus("IN_SERVICE")}
                disabled={isAdvancingStatus}
                className="w-full py-4 rounded-2xl bg-primary text-slate-950 font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20"
              >
                START SERVICE
              </button>
            )}

            <button
              type="button"
              onClick={() => onAdvanceStatus("AWAITING_HANDOVER")}
              disabled={isAdvancingStatus || booking.status !== "COMPLETED"}
              className="w-full py-4 rounded-2xl bg-[#2e3447] text-muted-foreground text-xs font-black uppercase tracking-wider hover:text-foreground transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              INITIATE HANDOVER
            </button>

            {(booking.status === "CONFIRMED" || booking.status === "PENDING" || booking.status === "CHECKED_IN") && (
              <button
                type="button"
                onClick={() => onAdvanceStatus("NO_SHOW")}
                disabled={isAdvancingStatus}
                className="w-full py-3 rounded-2xl border border-red-500/40 text-red-400/80 hover:text-red-400 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                MARK NO-SHOW
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
