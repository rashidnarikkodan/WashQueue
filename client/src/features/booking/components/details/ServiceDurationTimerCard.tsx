import { useState, useEffect, useMemo } from "react"
import { Clock, CheckCircle2, XCircle, Info } from "lucide-react"
import type { BookingResponse } from "@/shared/apis/booking.api"

interface ServiceDurationTimerCardProps {
  booking: BookingResponse
  mode?: "countdown" | "elapsed"
  formattedTimeStr?: string
}

export default function ServiceDurationTimerCard({
  booking,
  mode = "countdown",
  formattedTimeStr,
}: ServiceDurationTimerCardProps) {
  const [nowMs] = useState(() => Date.now())
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)

  const serviceName = booking.serviceType === "FULL" ? "Complete Full Wash" : "Express Half Wash"

  const isServiceStarted = Boolean(
    booking.serviceStartedAt ||
    booking.checkedInAt ||
    booking.status === "IN_SERVICE" ||
    booking.status === "SERVICE_COMPLETED" ||
    booking.status === "AWAITING_HANDOVER" ||
    booking.status === "COMPLETED"
  )

  useEffect(() => {
    if (mode !== "elapsed") return
    if (!isServiceStarted || booking.status === "CANCELLED" || booking.status === "NO_SHOW") return

    const startTimeStr = booking.serviceStartedAt || booking.checkedInAt
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
    mode,
    isServiceStarted,
    booking.serviceStartedAt,
    booking.checkedInAt,
    booking.completedAt,
    booking.status,
    booking.updatedAt,
  ])

  const actualElapsedSeconds =
    !isServiceStarted || booking.status === "CANCELLED" || booking.status === "NO_SHOW"
      ? 0
      : elapsedSeconds

  const formattedTimer = useMemo(() => {
    const hrs = Math.floor(actualElapsedSeconds / 3600)
    const mins = Math.floor((actualElapsedSeconds % 3600) / 60)
    const secs = actualElapsedSeconds % 60
    const pad = (n: number) => n.toString().padStart(2, "0")
    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
    return `${pad(mins)}:${pad(secs)}`
  }, [actualElapsedSeconds])

  if (mode === "elapsed") {
    return (
      <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-4 text-left">
        <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase text-muted-foreground block">
              SCHEDULED AT
            </span>
            <span className="text-xs font-bold text-foreground block">
              {new Date(booking.scheduling.windowStart).toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-[11px] text-muted-foreground">{formattedTimeStr || ""}</span>
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

        {isServiceStarted && booking.status !== "CANCELLED" && booking.status !== "NO_SHOW" ? (
          <div className="p-5 rounded-2xl border border-primary/20 bg-muted/40 text-center space-y-1">
            <span className="text-[9px] font-black uppercase text-muted-foreground block tracking-widest">
              {booking.completedAt || booking.status === "COMPLETED"
                ? "TOTAL SERVICE DURATION"
                : "LIVE SERVICE ELAPSED TIME"}
            </span>
            <div className="flex items-center justify-center gap-2 text-primary font-mono text-3xl font-bold">
              {(booking.status === "IN_SERVICE" || booking.status === "CHECKED_IN") && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              )}
              <span>{formattedTimer}</span>
            </div>
          </div>
        ) : booking.status === "CANCELLED" ? (
          <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-destructive">
                Booking Cancelled
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-destructive/20 text-destructive">
                Inactive
              </span>
            </div>
            <p className="text-xs text-foreground">
              {booking.cancellation?.cancellationReason || "Cancelled by customer before service."}
            </p>
            {booking.cancellation?.cancelledAt && (
              <span className="text-[10px] text-muted-foreground font-mono block">
                Cancelled:{" "}
                {new Date(booking.cancellation.cancelledAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        ) : booking.status === "NO_SHOW" ? (
          <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-1 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-destructive block">
              Customer No-Show
            </span>
            <p className="text-xs text-muted-foreground">
              The vehicle was not presented during the scheduled slot window.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                Awaiting Arrival
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-500">
                Upcoming
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Vehicle scheduled for service. Check-in will start execution tracking.
            </p>
          </div>
        )}
      </div>
    )
  }

  // Customer Mode: Countdown / Breakdown
  const durationBreakdown = booking.serviceDurationBreakdown || {
    baseMinutes: booking.serviceType === "FULL" ? 40 : 20,
    extraServicesMinutes: (booking.extraServices?.length || 0) * 5,
    vehicleClassModifierMinutes: 0,
    totalEstimatedMinutes:
      (booking.serviceType === "FULL" ? 40 : 20) + (booking.extraServices?.length || 0) * 5,
  }

  const estimatedWashDuration =
    booking.estimatedServiceDurationMinutes || durationBreakdown.totalEstimatedMinutes

  const serviceStartMs = booking.serviceStartedAt
    ? new Date(booking.serviceStartedAt).getTime()
    : booking.checkedInAt
      ? new Date(booking.checkedInAt).getTime()
      : null

  const elapsedServiceMinutes = serviceStartMs
    ? Math.max(0, Math.floor((nowMs - serviceStartMs) / (1000 * 60)))
    : 0

  const remainingServiceMinutes = Math.max(1, estimatedWashDuration - elapsedServiceMinutes)

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-6 text-left relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Clock size={16} />
            <span>Estimated Wash Time</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <span>~{estimatedWashDuration} Mins</span>
            <span className="text-xs font-semibold text-muted-foreground font-sans bg-muted px-3 py-1 rounded-full border border-border">
              {serviceName}
            </span>
          </h3>
        </div>

        {booking.status === "IN_SERVICE" ? (
          <div className="px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-500 text-xs font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            <span>Wash In Progress (~{remainingServiceMinutes} mins remaining)</span>
          </div>
        ) : booking.status === "CHECKED_IN" ? (
          <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Checked In · Bay Assignment in Queue</span>
          </div>
        ) : booking.status === "COMPLETED" ? (
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Service Completed Cleanly</span>
          </div>
        ) : booking.status === "CANCELLED" || booking.status === "NO_SHOW" ? (
          <div className="px-4 py-2 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold flex items-center gap-2">
            <XCircle size={16} />
            <span>{booking.status === "CANCELLED" ? "Booking Cancelled" : "Slot Expired"}</span>
          </div>
        ) : (
          <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-2">
            <Clock size={14} />
            <span>Estimated Slot Execution</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
            Base Wash Duration
          </span>
          <span className="text-sm sm:text-base font-bold text-foreground">
            {durationBreakdown.baseMinutes} mins
          </span>
          <p className="text-[11px] text-muted-foreground">
            {booking.serviceType === "FULL" ? "Comprehensive wash" : "Express quick wash"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
            Add-On Treatments
          </span>
          <span className="text-sm sm:text-base font-bold text-foreground">
            +{durationBreakdown.extraServicesMinutes} mins
          </span>
          <p className="text-[11px] text-muted-foreground">
            {booking.extraServices?.length || 0} extra service
            {booking.extraServices?.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
            Vehicle Class Modifier
          </span>
          <span className="text-sm sm:text-base font-bold text-foreground">
            {durationBreakdown.vehicleClassModifierMinutes > 0
              ? `+${durationBreakdown.vehicleClassModifierMinutes} mins`
              : "Standard (+0 min)"}
          </span>
          <p className="text-[11px] text-muted-foreground">
            {booking.vehicleDetails?.model || "Standard vehicle profile"}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3.5 text-xs text-muted-foreground leading-relaxed">
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
          <Info size={16} />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-foreground text-xs sm:text-sm">
              How Queue Waiting Time Works
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 font-bold">
              Arrival &amp; Check-In Based
            </span>
          </div>
          <p className="text-muted-foreground text-[11px] sm:text-xs">
            Your booking secures your service slot window. Once you arrive at the station and
            complete check-in (via QR scan / pre-inspection), your vehicle is entered into the live
            operational queue.
          </p>
        </div>
      </div>
    </div>
  )
}
