import { CheckCircle2 } from "lucide-react"
import type { BookingResponse } from "@/shared/apis/booking.api"

interface BookingStatusTrackerProps {
  booking: BookingResponse
  currentStageIndex: number
  title?: string
  stages?: Array<{ id: string; label: string }>
}

export default function BookingStatusTracker({
  booking,
  currentStageIndex,
  title = "Service Progress",
  stages = [
    { id: "CONFIRMED", label: "Confirmed" },
    { id: "CHECKED_IN", label: "In Queue" },
    { id: "IN_SERVICE", label: "Washing" },
    { id: "SERVICE_COMPLETED", label: "Ready" },
    { id: "COMPLETED", label: "Completed" },
  ],
}: BookingStatusTrackerProps) {
  const isCancelled = booking.status === "CANCELLED" || booking.status === "NO_SHOW"

  const progressPercentText = isCancelled
    ? booking.status === "NO_SHOW"
      ? "No-Show"
      : "Cancelled"
    : currentStageIndex >= 0
      ? `${(currentStageIndex + 1) * 20}% Completed`
      : "Pending"

  return (
    <div className="space-y-4 pt-2 text-left">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
        <span>{title}</span>
        <span className={`font-semibold ${isCancelled ? "text-destructive" : "text-primary"}`}>
          {progressPercentText}
        </span>
      </div>

      <div className="relative flex justify-between items-center z-10 px-2">
        <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-muted -z-10 rounded-full" />
        <div
          className="absolute top-1/2 left-4 h-1 -translate-y-1/2 bg-gradient-to-r from-primary to-emerald-400 -z-10 rounded-full transition-all duration-500"
          style={{
            width:
              currentStageIndex < 0 || isCancelled
                ? "0%"
                : `${(currentStageIndex / (stages.length - 1)) * 100}%`,
          }}
        />

        {stages.map((stg, idx) => {
          const isPassed = !isCancelled && currentStageIndex >= idx
          const isCurrent = !isCancelled && currentStageIndex === idx

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
