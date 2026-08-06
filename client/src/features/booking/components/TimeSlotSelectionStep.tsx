import { useMemo } from "react"
import { Check, AlertCircle, Ban } from "lucide-react"
import DatePicker from "@/shared/components/ui/DatePicker"

export interface TimeSlotOption {
  id: string
  timeWindow: string // e.g. "09:00 - 10:00"
  label: string // e.g. "Morning Slot", "Selected", "Fully Booked", "Time Elapsed", "2 Slots Left"
  status: "AVAILABLE" | "SELECTED" | "LIMITED" | "FULL" | "PAST"
  slotsLeft?: number
}

export interface CalendarDateEntry {
  date: string
  status: "AVAILABLE" | "FULL" | "HOLIDAY" | "CLOSED"
}

interface TimeSlotSelectionStepProps {
  selectedDate: string
  onDateChange: (date: string) => void
  slots: TimeSlotOption[]
  selectedSlotId: string | null
  onSelectSlot: (slotId: string) => void
  minDate?: string
  maxDate?: string
  disabledDates?: string[]
  calendarDates?: CalendarDateEntry[]
  isLoadingSlots?: boolean
}

export default function TimeSlotSelectionStep({
  selectedDate,
  onDateChange,
  slots,
  selectedSlotId,
  onSelectSlot,
  minDate,
  maxDate,
  disabledDates = [],
  calendarDates = [],
  isLoadingSlots = false,
}: TimeSlotSelectionStepProps) {

  // Quick date chips derived from calendar API entries (or fallback date offsets)
  const dateOptions = useMemo(() => {
    if (calendarDates.length > 0) {
      return calendarDates.map((item) => {
        const d = new Date(item.date + "T00:00:00")
        const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
        return {
          isoDate: item.date,
          label,
          status: item.status,
          isDisabled: item.status !== "AVAILABLE",
        }
      })
    }

    const today = new Date()
    return [0, 1, 2, 3, 4, 5, 6].map((offset) => {
      const d = new Date(today)
      d.setDate(d.getDate() + offset)
      const isoDate = d.toISOString().split("T")[0]
      const label =
        offset === 0
          ? "Today"
          : offset === 1
            ? "Tomorrow"
            : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
      const isDisabled = disabledDates.includes(isoDate)
      return { isoDate, label, status: isDisabled ? "CLOSED" : "AVAILABLE", isDisabled }
    })
  }, [calendarDates, disabledDates])

  const todayIso = minDate || new Date().toISOString().split("T")[0]

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {/* Step Header */}
      <div className="flex items-center gap-4 w-full">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shrink-0 shadow-md shadow-primary/20">
          3
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Time Window of Bookings
        </h2>
      </div>

      <div className="flex flex-col gap-6 pl-0 sm:pl-14">
        {/* Date Selector Header */}
        <div className="space-y-3 text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            SERVICE DATE
          </div>

          <div className="space-y-3">
            <DatePicker
              value={selectedDate}
              onChange={onDateChange}
              minDate={todayIso}
              maxDate={maxDate}
              disabledDates={disabledDates}
              placeholder="Select service date..."
            />

            {/* Quick Date Chips Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {dateOptions.map((opt) => {
                const isActive = selectedDate === opt.isoDate
                const isChipDisabled = opt.isDisabled

                return (
                  <button
                    key={opt.isoDate}
                    type="button"
                    disabled={isChipDisabled}
                    onClick={() => {
                      if (!isChipDisabled) onDateChange(opt.isoDate)
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      isChipDisabled
                        ? "bg-muted/40 text-muted-foreground/50 border border-border/30 cursor-not-allowed line-through opacity-60"
                        : isActive
                        ? "bg-primary text-primary-foreground shadow-xs cursor-pointer"
                        : "bg-muted text-muted-foreground border border-border hover:text-foreground cursor-pointer"
                    }`}
                  >
                    {opt.label}
                    {opt.status === "HOLIDAY" && " (Holiday)"}
                    {opt.status === "CLOSED" && " (Closed)"}
                    {opt.status === "FULL" && " (Full)"}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Time Windows Grid */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              AVAILABLE WINDOWS
            </span>
          </div>

          {isLoadingSlots ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl border border-border bg-card/50 animate-pulse p-4" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-border bg-card/30 text-center text-sm text-muted-foreground">
              No available booking windows for this date.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {slots.map((slot) => {
              const isSelected = selectedSlotId === slot.id
              const isFull = slot.status === "FULL"
              const isPast = slot.status === "PAST"
              const isLimited = slot.status === "LIMITED"
              const isDisabled = isFull || isPast

              let cardStyle = "border-border bg-card hover:border-primary/50 cursor-pointer shadow-xs"
              let timeStyle = "text-foreground"
              let subStyle = "text-muted-foreground"

              if (isSelected) {
                cardStyle =
                  "border-2 border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 scale-[1.01] cursor-pointer"
                timeStyle = "text-emerald-600 dark:text-emerald-400"
                subStyle = "text-emerald-600/80 dark:text-emerald-400/80 font-medium"
              } else if (isPast) {
                cardStyle =
                  "border-border/40 bg-muted/30 opacity-40 cursor-not-allowed pointer-events-none"
                timeStyle = "text-muted-foreground/60 line-through"
                subStyle = "text-muted-foreground/60 font-semibold"
              } else if (isFull) {
                cardStyle =
                  "border-border/50 bg-muted/40 opacity-50 cursor-not-allowed pointer-events-none"
                timeStyle = "text-muted-foreground line-through"
                subStyle = "text-red-500 font-bold"
              } else if (isLimited) {
                cardStyle =
                  "border-amber-500/50 bg-amber-500/10 hover:border-amber-500/80 cursor-pointer"
                subStyle = "text-amber-600 dark:text-amber-400 font-medium"
              }

              return (
                <div
                  key={slot.id}
                  onClick={() => {
                    if (!isDisabled) onSelectSlot(slot.id)
                  }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${cardStyle}`}
                >
                  <div className="flex flex-col text-left">
                    <span className={`text-base font-bold ${timeStyle}`}>
                      {slot.timeWindow}
                    </span>
                    <span className={`text-xs ${subStyle}`}>
                      {isSelected ? "Selected" : isPast ? "Time Elapsed" : isFull ? "Fully Booked" : slot.label}
                    </span>
                  </div>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check size={13} className="stroke-[3]" />
                    </div>
                  ) : isPast ? (
                    <Ban size={16} className="text-muted-foreground/40 shrink-0" />
                  ) : isFull ? (
                    <Ban size={16} className="text-red-400 shrink-0" />
                  ) : isLimited ? (
                    <AlertCircle size={16} className="text-amber-500 shrink-0" />
                  ) : null}
                </div>
              )
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
