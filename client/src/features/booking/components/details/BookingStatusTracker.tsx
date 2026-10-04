import { useMemo } from "react"
import { CheckCircle2, Clock } from "lucide-react"
import type { BookingResponse } from "@/shared/apis/booking.api"

interface BookingStatusTrackerProps {
  booking: BookingResponse
  variant?: "stepper" | "timeline"
  currentStageIndex: number
  stages?: Array<{ id: string; label: string }>
}

export default function BookingStatusTracker({
  booking,
  variant = "stepper",
  currentStageIndex,
  stages = [
    { id: "CONFIRMED", label: "Confirmed" },
    { id: "CHECKED_IN", label: "In Queue" },
    { id: "IN_SERVICE", label: "Washing" },
    { id: "SERVICE_COMPLETED", label: "Ready" },
    { id: "COMPLETED", label: "Completed" },
  ],
}: BookingStatusTrackerProps) {
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

    const currentStatus = booking.status
    const isCancelled = currentStatus === "CANCELLED"
    const isNoShow = currentStatus === "NO_SHOW"

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
      const recordedTime = historyMap.get(stg.id)
      const stageIdx = order.indexOf(stg.id)
      const active = currentStatus === stg.id
      const done = recordedTime
        ? true
        : currentIdx >= stageIdx && currentIdx !== -1 && !isCancelled && !isNoShow

      return {
        id: stg.id,
        label: stg.label,
        time:
          isCancelled && !recordedTime
            ? "Cancelled"
            : isNoShow && !recordedTime
              ? "No-Show"
              : recordedTime || (active ? "In Progress" : done ? "Done" : "Pending"),
        done,
        active,
        isCancelled: isCancelled && !recordedTime,
      }
    })
  }, [booking.statusHistory, booking.status, stages])

  if (variant === "timeline") {
    return (
      <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-6 text-left">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <h3 className="text-base font-bold text-foreground">Live Execution Timeline</h3>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
              booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : "bg-primary/10 text-primary border border-primary/20"
            }`}
          >
            {booking.status === "CANCELLED"
              ? "TERMINATED"
              : booking.status === "NO_SHOW"
                ? "EXPIRED"
                : "REAL-TIME"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
          {timelineSteps.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center text-center space-y-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                  step.isCancelled
                    ? "bg-muted border border-destructive/20 text-destructive/50"
                    : step.active
                      ? "bg-card border-4 border-primary text-primary scale-110 shadow-primary/30"
                      : step.done
                        ? "bg-primary text-primary-foreground font-black"
                        : "bg-muted border border-border text-muted-foreground"
                }`}
              >
                {step.done ? <CheckCircle2 size={16} /> : idx + 1}
              </div>
              <div className="space-y-0.5">
                <span
                  className={`text-xs font-bold block ${
                    step.isCancelled ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {step.label}
                </span>
                <span
                  className={`text-[10px] block ${
                    step.isCancelled ? "text-destructive/70" : "text-muted-foreground"
                  }`}
                >
                  {step.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
        <span>Service Progress</span>
        <span className="text-primary font-semibold">
          {currentStageIndex >= 0 ? `${(currentStageIndex + 1) * 20}% Completed` : "Cancelled"}
        </span>
      </div>

      <div className="relative flex justify-between items-center z-10 px-2">
        <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-muted -z-10 rounded-full" />
        <div
          className="absolute top-1/2 left-4 h-1 -translate-y-1/2 bg-gradient-to-r from-primary to-emerald-400 -z-10 rounded-full transition-all duration-500"
          style={{
            width:
              currentStageIndex < 0 ? "0%" : `${(currentStageIndex / (stages.length - 1)) * 100}%`,
          }}
        />

        {stages.map((stg, idx) => {
          const isPassed = currentStageIndex >= idx
          const isCurrent = currentStageIndex === idx
          return (
            <div key={stg.id} className="flex flex-col items-center gap-2 text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                  isCurrent
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110"
                    : isPassed
                      ? "bg-emerald-500 text-primary-foreground font-black"
                      : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {isPassed ? <CheckCircle2 size={18} /> : idx + 1}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isCurrent
                    ? "text-primary"
                    : isPassed
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {stg.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
