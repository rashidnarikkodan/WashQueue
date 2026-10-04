import { useMemo } from "react"
import { CalendarCheck, QrCode, Sparkles, ShieldCheck, CheckCircle2, Check } from "lucide-react"
import type { BookingResponse } from "@/shared/types/booking.types"
import { BOOKING_STATUS } from "@/shared/constants/booking.constants"

interface StageConfig {
  id: string
  label: string
  icon: React.ElementType
}

interface BookingStatusTrackerProps {
  booking: BookingResponse
  currentStageIndex?: number
  title?: string
  stages?: Array<{ id: string; label: string }>
}

const DEFAULT_STAGES: StageConfig[] = [
  { id: BOOKING_STATUS.CONFIRMED, label: "Confirmed", icon: CalendarCheck },
  { id: BOOKING_STATUS.CHECKED_IN, label: "In Queue", icon: QrCode },
  { id: BOOKING_STATUS.IN_SERVICE, label: "Washing", icon: Sparkles },
  { id: BOOKING_STATUS.SERVICE_COMPLETED, label: "Ready", icon: ShieldCheck },
  { id: BOOKING_STATUS.COMPLETED, label: "Completed", icon: CheckCircle2 },
]

export default function BookingStatusTracker({
  booking,
  currentStageIndex: customStageIndex,
  title = "Live Service Progress",
  stages = DEFAULT_STAGES,
}: BookingStatusTrackerProps) {
  // Determine stage index based on booking status machine if not provided explicitly
  const computedStageIndex = useMemo(() => {
    switch (booking.status) {
      case BOOKING_STATUS.CONFIRMED:
      case BOOKING_STATUS.PENDING:
        return 0
      case BOOKING_STATUS.CHECKED_IN:
        return 1
      case BOOKING_STATUS.IN_SERVICE:
        return 2
      case BOOKING_STATUS.SERVICE_COMPLETED:
      case BOOKING_STATUS.AWAITING_HANDOVER:
        return 3
      case BOOKING_STATUS.COMPLETED:
        return 4
      default:
        return -1
    }
  }, [booking.status])

  const stageIndex = customStageIndex ?? computedStageIndex

  const isCancelled =
    booking.status === BOOKING_STATUS.CANCELLED || booking.status === BOOKING_STATUS.NO_SHOW
  const isStalled = booking.status === BOOKING_STATUS.STALLED

  // Derive timestamp per stage from booking or status history
  const stageTimestamps = useMemo(() => {
    const history = booking.statusHistory || []

    const findHistoryTime = (status: string) => {
      const item = history.find((h) => h.toStatus === status)
      return item?.createdAt ? new Date(item.createdAt) : null
    }

    const formatTime = (date: Date | null | undefined) => {
      if (!date) return null
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const tConfirmed = booking.createdAt
      ? new Date(booking.createdAt)
      : findHistoryTime(BOOKING_STATUS.CONFIRMED)

    const tCheckedIn = booking.checkedInAt
      ? new Date(booking.checkedInAt)
      : findHistoryTime(BOOKING_STATUS.CHECKED_IN)

    const tStarted = booking.serviceStartedAt
      ? new Date(booking.serviceStartedAt)
      : findHistoryTime(BOOKING_STATUS.IN_SERVICE)

    const tServiceCompleted = booking.serviceCompletedAt
      ? new Date(booking.serviceCompletedAt)
      : findHistoryTime(BOOKING_STATUS.SERVICE_COMPLETED)

    const tCompleted = booking.completedAt
      ? new Date(booking.completedAt)
      : findHistoryTime(BOOKING_STATUS.COMPLETED)

    return [
      formatTime(tConfirmed),
      formatTime(tCheckedIn),
      formatTime(tStarted),
      formatTime(tServiceCompleted),
      formatTime(tCompleted),
    ]
  }, [booking])

  // Calculate percentage text
  const progressPercentText = useMemo(() => {
    if (isCancelled) {
      return booking.status === BOOKING_STATUS.NO_SHOW ? "No-Show" : "Cancelled"
    }
    if (isStalled) return "Service Stalled"
    if (stageIndex < 0) return "Pending"
    if (stageIndex >= stages.length - 1) return "100% Completed"
    return `${Math.round(((stageIndex + 1) / stages.length) * 100)}% Completed`
  }, [stageIndex, isCancelled, isStalled, booking.status, stages.length])

  return (
    <div className="space-y-4 pt-2 text-left">
      {/* Clean Flat Header */}
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
        <span>{title}</span>
        <span
          className={`font-semibold ${
            isCancelled ? "text-destructive" : isStalled ? "text-amber-500" : "text-primary"
          }`}
        >
          {progressPercentText}
        </span>
      </div>

      {/* Flat Stepper Pipeline */}
      <div className="relative py-2">
        {Array.from({ length: Math.max(0, stages.length - 1) }).map((_, segIdx) => {
          const isFilledSeg = !isCancelled && segIdx < stageIndex
          const isLeadingSeg = !isCancelled && stageIndex > 0 && segIdx === stageIndex - 1

          return (
            <div
              key={`seg-${segIdx}`}
              className="absolute top-[25px] h-1.5 z-0 overflow-hidden"
              style={{
                left: `${10 + segIdx * 20}%`,
                width: "20%",
              }}
            >
              {/* Background track segment between nodes */}
              <div className="w-full h-full bg-muted-foreground/25 dark:bg-slate-700/80 rounded-full" />

              {/* Animated fill line for segment (stops at active stage node) */}
              <div
                className={`absolute inset-0 h-full rounded-full transition-all duration-700 ease-out ${
                  isFilledSeg
                    ? isLeadingSeg
                      ? "w-full bg-gradient-to-r from-emerald-500 to-primary shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      : "w-full bg-emerald-500 shadow-xs shadow-emerald-500/30"
                    : "w-0 bg-transparent"
                }`}
              >
                {/* Shimmer light sweep on leading active segment */}
                {isLeadingSeg && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse opacity-80" />
                )}
              </div>
            </div>
          )
        })}

        {/* 5 Node Grid Columns */}
        <div className="grid grid-cols-5 gap-1 text-center relative z-10">
          {stages.map((stg, idx) => {
            const isPassed = !isCancelled && stageIndex > idx
            const isCurrent = !isCancelled && stageIndex === idx

            const StageIcon =
              (stg as StageConfig).icon || DEFAULT_STAGES[idx]?.icon || CalendarCheck
            const timestamp = stageTimestamps[idx]

            return (
              <div key={stg.id} className="flex flex-col items-center gap-2 text-center">
                {/* Node Circle (40px x 40px) */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm relative z-10 ${
                    isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110"
                      : isPassed
                        ? "bg-emerald-500 text-white font-black"
                        : isCancelled
                          ? "bg-background text-muted-foreground/40 border border-border/40"
                          : "bg-background text-muted-foreground border border-border/80"
                  }`}
                >
                  {isPassed ? <Check size={18} strokeWidth={2.5} /> : <StageIcon size={18} />}

                  {/* Active Pulse Dot on Current Node */}
                  {isCurrent && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-white dark:border-slate-900" />
                    </span>
                  )}
                </div>

                {/* Node Label & Optional Timestamp */}
                <div className="space-y-0.5">
                  <span
                    className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider block leading-tight ${
                      isCurrent
                        ? "text-primary"
                        : isPassed
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {stg.label}
                  </span>

                  {timestamp && (
                    <span className="text-[9px] font-mono text-muted-foreground/80 block">
                      {timestamp}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
