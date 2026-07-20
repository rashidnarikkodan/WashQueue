import { useState, useEffect } from "react"
import { Clock, Calendar, Info, ArrowRight, Plus, X } from "lucide-react"
import FormInput from "@/shared/components/form/FormInput"
import FormSwitch from "@/shared/components/form/FormSwitch"
import DatePicker from "@/shared/components/ui/DatePicker"
import { availabilitySchema, type AvailabilityFormData } from "../../schemas/station.schema"

interface AvailabilityFormProps {
  initialValues?: Partial<AvailabilityFormData> & { holidays?: { date: string; reason?: string }[] }
  onSubmit: (data: AvailabilityFormData & { holidays?: { date: string; reason?: string }[] }) => void
  onBack: () => void
  isLoading?: boolean
}

const DEFAULT_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

export default function AvailabilityForm({
  initialValues,
  onSubmit,
  onBack,
  isLoading = false,
}: AvailabilityFormProps) {
  const [formData, setFormData] = useState<AvailabilityFormData>({
    operatingHours: initialValues?.operatingHours || DEFAULT_DAYS.map((day) => ({
      day,
      open: "09:00",
      close: "18:00",
      isClosed: false,
    })),
    bays: initialValues?.bays ?? 2,
    windowDurationMins: initialValues?.windowDurationMins ?? 30,
    capacityPerWindow: initialValues?.capacityPerWindow ?? 1,
    walkInReservedSlots: initialValues?.walkInReservedSlots ?? 0,
    maxAdvanceBookingDays: initialValues?.maxAdvanceBookingDays ?? 7,
    bufferBetweenWindowsMins: initialValues?.bufferBetweenWindowsMins ?? 0,
    allowWalkIns: initialValues?.allowWalkIns ?? true,
  })

  const [applySameSchedule, setApplySameSchedule] = useState(false)
  const [holidays, setHolidays] = useState<{ date: string; reason?: string }[]>(
    initialValues?.holidays || []
  )
  const [showAddHoliday, setShowAddHoliday] = useState(false)
  const [newHolidayDate, setNewHolidayDate] = useState("")
  const [newHolidayReason, setNewHolidayReason] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Apply schedule of first day to all active days if applySameSchedule is toggled
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

  const handleFieldChange = (field: keyof AvailabilityFormData, value: number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddHoliday = () => {
    if (!newHolidayDate) return
    setHolidays((prev) => [...prev, { date: newHolidayDate, reason: newHolidayReason }])
    setNewHolidayDate("")
    setNewHolidayReason("")
    setShowAddHoliday(false)
  }

  const handleRemoveHoliday = (index: number) => {
    setHolidays((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validation = availabilitySchema.safeParse(formData)
    if (!validation.success) {
      const errMap: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        const path = String(issue.path[0])
        if (path) errMap[path] = issue.message
      })
      setErrors(errMap)
      return
    }

    setErrors({})
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
              <div key={item.day} className="grid grid-cols-4 items-center px-6 py-4 hover:bg-slate-900/40 transition-colors">
                <div className="text-sm font-semibold text-[#DCE1FB]">
                  {item.day}
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
                <div>
                  <input
                    type="time"
                    disabled={item.isClosed}
                    value={item.close}
                    onChange={(e) => handleTimeChange(idx, "close", e.target.value)}
                    className="bg-[#2E3447] text-white text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700/60 outline-none focus:border-primary disabled:opacity-40"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Time Window & Bays Configuration */}
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
            value={formData.bays}
            onChange={(e) => handleFieldChange("bays", parseInt(e.target.value) || 0)}
            error={errors.bays}
          />
          <FormInput
            label="WINDOW DURATION (MINS)"
            type="number"
            placeholder="30"
            value={formData.windowDurationMins}
            onChange={(e) => handleFieldChange("windowDurationMins", parseInt(e.target.value) || 0)}
            error={errors.windowDurationMins}
          />
          <FormInput
            label="WALK-IN RESERVED SLOTS"
            type="number"
            placeholder="1"
            value={formData.walkInReservedSlots}
            onChange={(e) => handleFieldChange("walkInReservedSlots", parseInt(e.target.value) || 0)}
            error={errors.walkInReservedSlots}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="CAPACITY PER WINDOW"
            type="number"
            placeholder="2"
            value={formData.capacityPerWindow}
            onChange={(e) => handleFieldChange("capacityPerWindow", parseInt(e.target.value) || 0)}
            error={errors.capacityPerWindow}
          />
          <FormInput
            label="MAXIMUM ADVANCED BOOKING DAYS"
            type="number"
            placeholder="7"
            value={formData.maxAdvanceBookingDays}
            onChange={(e) => handleFieldChange("maxAdvanceBookingDays", parseInt(e.target.value) || 0)}
            error={errors.maxAdvanceBookingDays}
          />
        </div>
      </div>

      {/* Section 3: Holidays */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-[#C2C6D6] uppercase">
            <Calendar size={16} className="text-[#ADC6FF]" />
            <span>HOLIDAYS & CLOSURES</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddHoliday(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#ADC6FF] hover:underline cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Holiday</span>
          </button>
        </div>

        {/* Add Holiday Inline Form */}
        {showAddHoliday && (
          <div className="p-4 rounded-xl border border-slate-800 bg-[#151B2D] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DatePicker
                value={newHolidayDate}
                onChange={setNewHolidayDate}
                placeholder="Select holiday date"
              />
              <input
                type="text"
                placeholder="Holiday reason (e.g. Christmas)"
                value={newHolidayReason}
                onChange={(e) => setNewHolidayReason(e.target.value)}
                className="bg-[#2E3447] text-white text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none placeholder:text-slate-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddHoliday(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddHoliday}
                className="px-4 py-1.5 text-xs font-bold bg-[#ADC6FF] text-[#002E6A] rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Holiday Chips */}
        <div className="flex flex-wrap gap-3">
          {holidays.map((hol, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-800 bg-slate-900/60 text-xs font-semibold text-[#DCE1FB]"
            >
              <span>{hol.date} {hol.reason ? `- ${hol.reason}` : ""}</span>
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

      {/* Footer Navigation */}
      <div className="flex justify-between items-center border-t border-slate-800/80 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-bold transition-all cursor-pointer"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#ADC6FF] text-[#002E6A] hover:bg-blue-300 disabled:opacity-50 text-sm font-bold px-8 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>{isLoading ? "Saving..." : "Continue"}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  )
}
