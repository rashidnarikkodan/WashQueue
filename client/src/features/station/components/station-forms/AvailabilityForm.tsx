import { useState, useEffect } from "react"
import { Clock, Calendar, Info, ArrowRight, X, Plus, Coffee, Trash2 } from "lucide-react"
import FormInput from "@/shared/components/form/FormInput"
import FormSwitch from "@/shared/components/form/FormSwitch"
import DatePicker from "@/shared/components/form/DatePicker"
import { availabilitySchema, type AvailabilityFormData } from "../../schemas/station.schema"
import type { OperatingBreak } from "../../types"

interface AvailabilityFormProps {
  initialValues?: Partial<AvailabilityFormData> & { holidays?: { date: string; reason?: string }[] }
  onSubmit: (
    data: AvailabilityFormData & { holidays?: { date: string; reason?: string }[] }
  ) => void
  onBack: () => void
  onCancel?: () => void
  isLoading?: boolean
}

const DEFAULT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function AvailabilityForm({
  initialValues,
  onSubmit,
  onBack,
  onCancel,
  isLoading = false,
}: AvailabilityFormProps) {
  const [formData, setFormData] = useState<AvailabilityFormData>({
    operatingHours:
      initialValues?.operatingHours ||
      DEFAULT_DAYS.map((day) => ({
        day,
        open: "09:00",
        close: "18:00",
        isClosed: false,
        breaks: [],
      })),
    bays: initialValues?.bays ?? 2,
    windowDurationMins: initialValues?.windowDurationMins ?? 30,
    capacityPerWindow: initialValues?.capacityPerWindow ?? 1,
    walkInReservedSlots: initialValues?.walkInReservedSlots ?? 0,
    maxAdvanceBookingDays: initialValues?.maxAdvanceBookingDays ?? 7,
    allowWalkIns: initialValues?.allowWalkIns ?? true,
  })

  const [applySameSchedule, setApplySameSchedule] = useState(false)
  const [holidays, setHolidays] = useState<{ date: string; reason?: string }[]>(
    initialValues?.holidays || []
  )
  const [newHolidayDate, setNewHolidayDate] = useState("")
  const [newHolidayReason, setNewHolidayReason] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (applySameSchedule && formData.operatingHours.length > 0) {
      const first = formData.operatingHours[0]
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({
        ...prev,
        operatingHours: prev.operatingHours.map((item) => ({
          ...item,
          open: first.open,
          close: first.close,
          breaks: first.breaks ? [...first.breaks] : [],
        })),
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applySameSchedule])

  const handleDayStatusChange = (index: number, isOpen: boolean) => {
    setFormData((prev) => {
      const next = [...prev.operatingHours]
      next[index] = { ...next[index], isClosed: !isOpen }
      return { ...prev, operatingHours: next }
    })
  }

  const handleTimeChange = (index: number, field: "open" | "close", value: string) => {
    setFormData((prev) => {
      const next = [...prev.operatingHours]
      next[index] = { ...next[index], [field]: value }

      if (applySameSchedule) {
        return {
          ...prev,
          operatingHours: next.map((item) => ({ ...item, [field]: value })),
        }
      }
      return { ...prev, operatingHours: next }
    })
  }

  const handleAddBreak = (dayIndex: number) => {
    setFormData((prev) => {
      const next = [...prev.operatingHours]
      const currentBreaks: OperatingBreak[] = next[dayIndex].breaks || []
      next[dayIndex] = {
        ...next[dayIndex],
        breaks: [...currentBreaks, { name: "Lunch Break", start: "13:00", end: "14:00" }],
      }
      return { ...prev, operatingHours: next }
    })
  }

  const handleRemoveBreak = (dayIndex: number, breakIndex: number) => {
    setFormData((prev) => {
      const next = [...prev.operatingHours]
      const currentBreaks = next[dayIndex].breaks || []
      next[dayIndex] = {
        ...next[dayIndex],
        breaks: currentBreaks.filter((_, idx) => idx !== breakIndex),
      }
      return { ...prev, operatingHours: next }
    })
  }

  const handleBreakChange = (
    dayIndex: number,
    breakIndex: number,
    field: "name" | "start" | "end",
    value: string
  ) => {
    setFormData((prev) => {
      const next = [...prev.operatingHours]
      const currentBreaks = [...(next[dayIndex].breaks || [])]
      currentBreaks[breakIndex] = {
        ...currentBreaks[breakIndex],
        [field]: value,
      }
      next[dayIndex] = { ...next[dayIndex], breaks: currentBreaks }
      return { ...prev, operatingHours: next }
    })
  }

  const handleFieldChange = (field: keyof AvailabilityFormData, value: number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddHoliday = () => {
    if (!newHolidayDate) return
    setHolidays((prev) => [...prev, { date: newHolidayDate, reason: newHolidayReason }])
    setNewHolidayDate("")
    setNewHolidayReason("")
  }

  const handleRemoveHoliday = (index: number) => {
    setHolidays((prev) => prev.filter((_, idx) => idx !== index))
  }

  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validation = availabilitySchema.safeParse(formData)
    const errMap: Record<string, string> = {}

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const path = String(issue.path[0])
        if (path) errMap[path] = issue.message
      })
    }

    if (formData.walkInReservedSlots > formData.capacityPerWindow) {
      errMap.walkInReservedSlots = "Walk-in reserved slots cannot exceed total window capacity"
    }

    const openDays = formData.operatingHours.filter((h) => !h.isClosed)
    if (openDays.length === 0) {
      setFormError("At least one operating day must be open.")
      return
    }

    for (const day of openDays) {
      if (!day.open || !day.close) {
        setFormError(`Opening and closing times are required for ${day.day}.`)
        return
      }
      if (day.open >= day.close) {
        setFormError(`Opening time must be earlier than closing time for ${day.day}.`)
        return
      }

      if (day.breaks && day.breaks.length > 0) {
        for (const brk of day.breaks) {
          if (brk.start >= brk.end) {
            setFormError(`Break start time must be earlier than end time on ${day.day}.`)
            return
          }
          if (brk.start < day.open || brk.end > day.close) {
            setFormError(
              `Break time (${brk.start} - ${brk.end}) must be within open hours (${day.open} - ${day.close}) on ${day.day}.`
            )
            return
          }
        }
      }
    }

    if (Object.keys(errMap).length > 0) {
      setErrors(errMap)
      setFormError("Please fix the highlighted field errors below.")
      return
    }

    setErrors({})
    setFormError(null)
    onSubmit({
      ...validation.data!,
      holidays,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left">
      <div className="space-y-2 border-b border-slate-800/80 pb-6">
        <span className="text-[12px] font-bold tracking-[2.4px] text-[#ADC6FF] uppercase">
          STEP 2 OF 5
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#DCE1FB] tracking-tight">
          Set Station Availability
        </h1>
        <p className="text-sm sm:text-base text-[#C2C6D6] opacity-80 font-normal">
          Define working days and operating hours for your service hub.
        </p>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-semibold flex items-center gap-2">
          <span>{formError}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl bg-[#151B2D]/80 border border-slate-800 gap-3">
        <div>
          <h4 className="text-sm font-bold text-[#DCE1FB]">Quick Setup</h4>
          <p className="text-xs text-[#C2C6D6]">Uniform scheduling across all active days</p>
        </div>
        <FormSwitch
          label="Apply same schedule for all days"
          checked={applySameSchedule}
          onChange={setApplySameSchedule}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-[#C2C6D6] uppercase">
          <Clock size={16} className="text-[#ADC6FF]" />
          <span>AVAILABLE DAYS & OFF DAYS</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#070D1F] overflow-hidden">
          <div className="grid grid-cols-4 px-6 py-3.5 bg-[#23293C]/50 text-[11px] font-bold tracking-wider text-[#C2C6D6] uppercase border-b border-slate-800">
            <div>DAY</div>
            <div>STATUS</div>
            <div>OPENING</div>
            <div>CLOSING</div>
          </div>

          <div className="divide-y divide-slate-800/60">
            {formData.operatingHours.map((item, idx) => (
              <div
                key={item.day}
                className="px-6 py-4 hover:bg-slate-900/40 transition-colors space-y-3"
              >
                <div className="grid grid-cols-4 items-center">
                  <div className="text-sm font-semibold text-[#DCE1FB] flex items-center gap-2">
                    <span>{item.day}</span>
                    {item.breaks && item.breaks.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {item.breaks.length} Break{item.breaks.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div>
                    <FormSwitch
                      label={item.isClosed ? "Closed" : "Open"}
                      checked={!item.isClosed}
                      onChange={(isOpen) => handleDayStatusChange(idx, isOpen)}
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      disabled={item.isClosed}
                      value={item.open}
                      onChange={(e) => handleTimeChange(idx, "open", e.target.value)}
                      className="bg-[#2E3447] text-white text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700/60 outline-none focus:border-primary disabled:opacity-40"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="time"
                      disabled={item.isClosed}
                      value={item.close}
                      onChange={(e) => handleTimeChange(idx, "close", e.target.value)}
                      className="bg-[#2E3447] text-white text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700/60 outline-none focus:border-primary disabled:opacity-40"
                    />
                    {!item.isClosed && (
                      <button
                        type="button"
                        onClick={() => handleAddBreak(idx)}
                        className="px-2.5 py-1 rounded-lg bg-[#ADC6FF]/10 text-[#ADC6FF] hover:bg-[#ADC6FF]/20 border border-[#ADC6FF]/20 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Add break time"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Break</span>
                      </button>
                    )}
                  </div>
                </div>

                {!item.isClosed && item.breaks && item.breaks.length > 0 && (
                  <div className="pl-4 border-l-2 border-amber-500/40 space-y-2 pt-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      <Coffee className="w-3.5 h-3.5 text-amber-400" />
                      <span>Configured Breaks for {item.day}</span>
                    </div>

                    <div className="space-y-2">
                      {item.breaks.map((brk, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl bg-[#151B2D] border border-slate-800"
                        >
                          <input
                            type="text"
                            placeholder="Break label (e.g. Lunch Break)"
                            value={brk.name || ""}
                            onChange={(e) => handleBreakChange(idx, bIdx, "name", e.target.value)}
                            className="flex-1 min-w-[140px] bg-[#2E3447] text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700/60 outline-none focus:border-primary"
                          />

                          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                            <span>Start:</span>
                            <input
                              type="time"
                              value={brk.start}
                              onChange={(e) =>
                                handleBreakChange(idx, bIdx, "start", e.target.value)
                              }
                              className="bg-[#2E3447] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700/60 outline-none focus:border-primary"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                            <span>End:</span>
                            <input
                              type="time"
                              value={brk.end}
                              onChange={(e) => handleBreakChange(idx, bIdx, "end", e.target.value)}
                              className="bg-[#2E3447] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700/60 outline-none focus:border-primary"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveBreak(idx, bIdx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Remove break"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-[#C2C6D6] uppercase">
          <Info size={16} className="text-[#ADC6FF]" />
          <span>TIME WINDOW & BAYS CONFIGURATION</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            label="NUMBER OF BAYS"
            type="number"
            placeholder="2"
            value={formData.bays === 0 || (formData.bays as unknown) === "" ? "" : formData.bays}
            onChange={(e) =>
              handleFieldChange(
                "bays",
                e.target.value === "" ? ("" as unknown as number) : parseInt(e.target.value)
              )
            }
            error={errors.bays}
          />
          <FormInput
            label="WINDOW DURATION (MINS)"
            type="number"
            placeholder="30"
            value={
              formData.windowDurationMins === 0 || (formData.windowDurationMins as unknown) === ""
                ? ""
                : formData.windowDurationMins
            }
            onChange={(e) =>
              handleFieldChange(
                "windowDurationMins",
                e.target.value === "" ? ("" as unknown as number) : parseInt(e.target.value)
              )
            }
            error={errors.windowDurationMins}
          />
          <FormInput
            label="WALK-IN RESERVED SLOTS"
            type="number"
            placeholder="1"
            value={
              formData.walkInReservedSlots === 0 || (formData.walkInReservedSlots as unknown) === ""
                ? ""
                : formData.walkInReservedSlots
            }
            onChange={(e) =>
              handleFieldChange(
                "walkInReservedSlots",
                e.target.value === "" ? ("" as unknown as number) : parseInt(e.target.value)
              )
            }
            error={errors.walkInReservedSlots}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="CAPACITY PER WINDOW"
            type="number"
            placeholder="2"
            value={
              formData.capacityPerWindow === 0 || (formData.capacityPerWindow as unknown) === ""
                ? ""
                : formData.capacityPerWindow
            }
            onChange={(e) =>
              handleFieldChange(
                "capacityPerWindow",
                e.target.value === "" ? ("" as unknown as number) : parseInt(e.target.value)
              )
            }
            error={errors.capacityPerWindow}
          />
          <FormInput
            label="MAXIMUM ADVANCED BOOKING DAYS"
            type="number"
            placeholder="7"
            value={
              formData.maxAdvanceBookingDays === 0 ||
              (formData.maxAdvanceBookingDays as unknown) === ""
                ? ""
                : formData.maxAdvanceBookingDays
            }
            onChange={(e) =>
              handleFieldChange(
                "maxAdvanceBookingDays",
                e.target.value === "" ? ("" as unknown as number) : parseInt(e.target.value)
              )
            }
            error={errors.maxAdvanceBookingDays}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-[#C2C6D6] uppercase">
            <Calendar size={16} className="text-[#ADC6FF]" />
            <span>HOLIDAYS & CLOSURES</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#151B2D] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <DatePicker
              value={newHolidayDate}
              onChange={setNewHolidayDate}
              placeholder="Select holiday date"
            />
            <FormInput
              type="text"
              placeholder="Holiday reason (e.g. Christmas)"
              value={newHolidayReason}
              onChange={(e) => setNewHolidayReason(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddHoliday}
              className="px-4 py-1.5 text-xs font-bold bg-[#ADC6FF] text-[#002E6A] rounded-lg"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {holidays.map((hol, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-800 bg-slate-900/60 text-xs font-semibold text-[#DCE1FB]"
            >
              <span>
                {hol.date} {hol.reason ? `- ${hol.reason}` : ""}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveHoliday(idx)}
                className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-slate-800/80 pt-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-bold transition-all cursor-pointer"
          >
            Back
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#ADC6FF] text-[#002E6A] hover:bg-blue-300 disabled:opacity-50 text-sm font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>{isLoading ? "Saving..." : "Save & Continue"}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  )
}
