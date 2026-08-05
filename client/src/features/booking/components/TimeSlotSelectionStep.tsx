import { Check, AlertCircle, Ban } from "lucide-react"
import DatePicker from "@/shared/components/ui/DatePicker"

export interface TimeSlotOption {
  id: string
  timeWindow: string // e.g. "09:00 - 10:00"
  label: string // e.g. "Morning Slot", "Selected", "Fully Booked", "Limited Availability", "2 Slots Left"
  status: "AVAILABLE" | "SELECTED" | "LIMITED" | "FULL"
  slotsLeft?: number
}

interface TimeSlotSelectionStepProps {
  selectedDate: string
  onDateChange: (date: string) => void
  slots: TimeSlotOption[]
  selectedSlotId: string | null
  onSelectSlot: (slotId: string) => void
}

export default function TimeSlotSelectionStep({
  selectedDate,
  onDateChange,
  slots,
  selectedSlotId,
  onSelectSlot,
}: TimeSlotSelectionStepProps) {

  // Quick date chips (Today, Tomorrow, +2 Days)
  const today = new Date()
  const todayIso = today.toISOString().split("T")[0]

  const dateOptions = [0, 1, 2, 3, 4].map((offset) => {
    const d = new Date(today)
    d.setDate(d.getDate() + offset)
    const isoDate = d.toISOString().split("T")[0]
    const label =
      offset === 0
        ? "Today"
        : offset === 1
          ? "Tomorrow"
          : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    return { isoDate, label }
  })

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
              placeholder="Select service date..."
            />

            {/* Quick Date Chips Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {dateOptions.map((opt) => {
                const isActive = selectedDate === opt.isoDate
                return (
                  <button
                    key={opt.isoDate}
                    type="button"
                    onClick={() => {
                      onDateChange(opt.isoDate)
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground border border-border hover:text-foreground"
                    }`}
                  >
                    {opt.label}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {slots.map((slot) => {
              const isSelected = selectedSlotId === slot.id
              const isFull = slot.status === "FULL"
              const isLimited = slot.status === "LIMITED"

              let cardStyle = "border-border bg-card hover:border-primary/50 cursor-pointer shadow-xs"
              let timeStyle = "text-foreground"
              let subStyle = "text-muted-foreground"

              if (isSelected) {
                cardStyle =
                  "border-2 border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 scale-[1.01] cursor-pointer"
                timeStyle = "text-emerald-600 dark:text-emerald-400"
                subStyle = "text-emerald-600/80 dark:text-emerald-400/80 font-medium"
              } else if (isFull) {
                cardStyle =
                  "border-border/50 bg-muted/40 opacity-50 cursor-not-allowed"
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
                    if (!isFull) onSelectSlot(slot.id)
                  }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${cardStyle}`}
                >
                  <div className="flex flex-col text-left">
                    <span className={`text-base font-bold ${timeStyle}`}>
                      {slot.timeWindow}
                    </span>
                    <span className={`text-xs ${subStyle}`}>
                      {isSelected ? "Selected" : isFull ? "Fully Booked" : slot.label}
                    </span>
                  </div>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check size={13} className="stroke-[3]" />
                    </div>
                  ) : isFull ? (
                    <Ban size={16} className="text-red-400 shrink-0" />
                  ) : isLimited ? (
                    <AlertCircle size={16} className="text-amber-500 shrink-0" />
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
