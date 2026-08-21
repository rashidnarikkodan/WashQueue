import { useState } from "react"
import {
  X,
  Calendar,
  Clock,
  Check,
  Ban,
  AlertCircle,
  CalendarClock,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import { bookingApi, type BookingResponse } from "@/shared/apis/booking.api"
import { useBookingSlots } from "../hooks/useBookingSlots"
import DatePicker from "@/shared/components/form/DatePicker"

interface RescheduleModalProps {
  booking: BookingResponse
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedBooking: BookingResponse) => void
}

export default function RescheduleModal({
  booking,
  isOpen,
  onClose,
  onSuccess,
}: RescheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    selectedDate,
    setSelectedDate,
    selectedSlotId,
    setSelectedSlotId,
    selectedSlot,
    bookingCalendar,
    disabledDates,
    timeSlotOptions,
    formattedDate,
    isLoadingSlots,
  } = useBookingSlots({ stationId: booking.stationId || null })

  if (!isOpen || !booking) return null

  const currentWindowStart = booking.scheduling?.windowStart
    ? new Date(booking.scheduling.windowStart)
    : null
  const currentWindowEnd = booking.scheduling?.windowEnd
    ? new Date(booking.scheduling.windowEnd)
    : null

  const currentFormattedDate = currentWindowStart
    ? currentWindowStart.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A"

  const currentFormattedTime =
    currentWindowStart && currentWindowEnd
      ? `${currentWindowStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${currentWindowEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : "N/A"

  const rescheduleCount = booking.rescheduleCount ?? 0
  const isMaxLimitReached = rescheduleCount >= 2

  // 24 hours eligibility check
  const isEligible = currentWindowStart
    ? currentWindowStart.getTime() - Date.now() >= 24 * 60 * 60 * 1000
    : false

  const isSameAsCurrentSlot = booking.scheduling?.timeWindowId === selectedSlotId

  const handleConfirmReschedule = async () => {
    if (isMaxLimitReached) {
      toast.error("Maximum limit of 2 reschedules reached for this booking")
      return
    }

    if (!selectedSlotId) {
      toast.error("Please select an available time window")
      return
    }

    if (isSameAsCurrentSlot) {
      toast.error("Please choose a different time window than your current booking")
      return
    }

    try {
      setIsSubmitting(true)
      const updated = await bookingApi.rescheduleBooking(booking.id, selectedSlotId)
      toast.success(`Booking #${booking.bookingNumber} rescheduled successfully!`)
      onSuccess(updated)
      onClose()
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      toast.error(errorObj?.message || "Failed to reschedule booking")
    } finally {
      setIsSubmitting(false)
    }
  }

  const todayIso = new Date().toISOString().split("T")[0]

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#191F31] text-[#DCE1FB] border border-[#8C909F]/20 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in zoom-in-95 my-8 text-left">
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 pb-4 border-b border-white/5 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Reschedule Booking
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase">
                  {rescheduleCount}/2 Used
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Booking #{booking.bookingNumber} • {booking.stationDetails?.name || "Station"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Current Schedule Summary */}
          <div className="p-4 rounded-2xl bg-[#151B2D] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">
                CURRENT SCHEDULED TIME
              </span>
              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>{currentFormattedDate}</span>
                <span className="text-muted-foreground font-normal">•</span>
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>{currentFormattedTime}</span>
              </div>
            </div>

            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {booking.status}
            </span>
          </div>

          {isMaxLimitReached ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-red-300">Maximum Limit Reached (2 / 2)</p>
                <p className="text-red-400/80">
                  This booking has already been rescheduled 2 times. Further rescheduling is not permitted.
                </p>
              </div>
            </div>
          ) : !isEligible ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-red-300">24-Hour Policy Restriction</p>
                <p className="text-red-400/80">
                  Rescheduling is only permitted at least 24 hours prior to your scheduled time
                  window start.
                </p>
              </div>
            </div>
          ) : null}

          {/* Date Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              SELECT NEW SERVICE DATE
            </label>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              minDate={bookingCalendar?.minDate || todayIso}
              maxDate={bookingCalendar?.maxDate}
              disabledDates={disabledDates}
              disabled={!isEligible || isMaxLimitReached}
              placeholder="Select new date..."
            />
          </div>

          {/* Available Slots Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                AVAILABLE TIME WINDOWS {formattedDate && `(${formattedDate})`}
              </span>
            </div>

            {isLoadingSlots ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-2xl border border-border bg-card/40 animate-pulse p-4"
                  />
                ))}
              </div>
            ) : timeSlotOptions.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-border bg-card/20 text-center text-xs text-muted-foreground">
                No available booking time windows found for this date.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {timeSlotOptions.map((slot) => {
                  const isSelected = selectedSlotId === slot.id
                  const isCurrent = booking.scheduling?.timeWindowId === slot.id
                  const isFull = slot.status === "FULL"
                  const isPast = slot.status === "PAST"
                  const isLimited = slot.status === "LIMITED"
                  const isDisabled = isFull || isPast || isCurrent

                  let cardStyle =
                    "border-border bg-card hover:border-primary/50 cursor-pointer shadow-xs"
                  let timeStyle = "text-foreground"
                  let subStyle = "text-muted-foreground"

                  if (isSelected) {
                    cardStyle =
                      "border-2 border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 scale-[1.01] cursor-pointer"
                    timeStyle = "text-emerald-400 font-bold"
                    subStyle = "text-emerald-400/90 font-medium"
                  } else if (isCurrent) {
                    cardStyle =
                      "border-primary/40 bg-primary/10 opacity-70 cursor-not-allowed pointer-events-none"
                    timeStyle = "text-primary font-bold"
                    subStyle = "text-primary/80 font-semibold"
                  } else if (isPast) {
                    cardStyle =
                      "border-border/40 bg-muted/30 opacity-40 cursor-not-allowed pointer-events-none"
                    timeStyle = "text-muted-foreground/60 line-through"
                    subStyle = "text-muted-foreground/60 font-semibold"
                  } else if (isFull) {
                    cardStyle =
                      "border-border/50 bg-muted/40 opacity-50 cursor-not-allowed pointer-events-none"
                    timeStyle = "text-muted-foreground line-through"
                    subStyle = "text-red-400 font-bold"
                  } else if (isLimited) {
                    cardStyle =
                      "border-amber-500/40 bg-amber-500/10 hover:border-amber-500/80 cursor-pointer"
                    subStyle = "text-amber-400 font-medium"
                  }

                  return (
                    <div
                      key={slot.id}
                      onClick={() => {
                        if (!isDisabled) setSelectedSlotId(slot.id)
                      }}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${cardStyle}`}
                    >
                      <div className="flex flex-col text-left">
                        <span className={`text-sm font-bold ${timeStyle}`}>{slot.timeWindow}</span>
                        <span className={`text-[11px] ${subStyle}`}>
                          {isSelected
                            ? "Selected for Reschedule"
                            : isCurrent
                              ? "Current Time Window"
                              : isPast
                                ? "Time Elapsed"
                                : isFull
                                  ? "Fully Booked"
                                  : slot.label}
                        </span>
                      </div>

                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                          <Check size={13} className="stroke-[3]" />
                        </div>
                      ) : isPast ? (
                        <Ban size={15} className="text-muted-foreground/40 shrink-0" />
                      ) : isFull ? (
                        <Ban size={15} className="text-red-400 shrink-0" />
                      ) : isLimited ? (
                        <AlertCircle size={15} className="text-amber-400 shrink-0" />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* New Selection Preview */}
          {selectedSlot && !isSameAsCurrentSlot && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">
                  NEW TIME WINDOW PREVIEW
                </span>
                <p className="text-xs font-bold text-foreground">
                  {formattedDate} • {selectedSlot.timeWindow}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400">Ready to update</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 sm:p-8 pt-4 border-t border-white/5 bg-[#151B2D]/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmReschedule}
            disabled={
              isSubmitting ||
              !selectedSlotId ||
              isSameAsCurrentSlot ||
              !isEligible ||
              isMaxLimitReached
            }
            className="px-6 py-2.5 rounded-xl bg-primary text-slate-950 hover:opacity-90 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Rescheduling...</span>
              </>
            ) : (
              <>
                <CalendarClock size={14} />
                <span>Confirm Reschedule</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
