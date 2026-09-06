import { useState, useRef, useEffect } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  label?: string
  placeholder?: string
  minDate?: string
  maxDate?: string
  disabledDates?: string[]
  disabled?: boolean
  error?: string
  id?: string
  className?: string
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function DatePicker({
  value = "",
  onChange,
  label,
  placeholder = "Select date...",
  minDate,
  maxDate,
  disabledDates = [],
  disabled = false,
  error,
  id,
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedDateObj = value ? new Date(value + "T00:00:00") : null

  const [viewDate, setViewDate] = useState(() => {
    if (selectedDateObj && !isNaN(selectedDateObj.getTime())) {
      return new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1)
    }
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  useEffect(() => {
    if (value) {
      const parsed = new Date(value + "T00:00:00")
      if (!isNaN(parsed.getTime())) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setViewDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1))
      }
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const prevMonthDays = new Date(year, month, 0).getDate()
  const trailingDaysCount = firstDayOfWeek

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isDisabled: boolean }[] =
    []

  for (let i = trailingDaysCount - 1; i >= 0; i--) {
    const dNum = prevMonthDays - i
    const prevDate = new Date(year, month - 1, dNum)
    const dateStr = formatDateISO(prevDate)
    days.push({
      dateStr,
      dayNum: dNum,
      isCurrentMonth: false,
      isDisabled: isDateDisabled(dateStr, minDate, maxDate),
    })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const currDate = new Date(year, month, d)
    const dateStr = formatDateISO(currDate)
    days.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isDisabled: isDateDisabled(dateStr, minDate, maxDate),
    })
  }

  const remainingSlots = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remainingSlots; i++) {
    const nextDate = new Date(year, month + 1, i)
    const dateStr = formatDateISO(nextDate)
    days.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: false,
      isDisabled: isDateDisabled(dateStr, minDate, maxDate),
    })
  }

  function formatDateISO(d: Date) {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }

  function isDateDisabled(dateStr: string, min?: string, max?: string) {
    if (min && dateStr < min) return true
    if (max && dateStr > max) return true
    if (disabledDates && disabledDates.includes(dateStr)) return true
    return false
  }

  const handleSelectDate = (dateStr: string) => {
    onChange(dateStr)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  const handleSelectToday = () => {
    const todayStr = formatDateISO(new Date())
    if (!isDateDisabled(todayStr, minDate, maxDate)) {
      onChange(todayStr)
      setIsOpen(false)
    }
  }

  const todayStr = formatDateISO(new Date())

  const displayFormatted =
    selectedDateObj && !isNaN(selectedDateObj.getTime())
      ? selectedDateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : ""

  return (
    <div className={`flex flex-col gap-1.5 w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1 text-left"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between bg-muted/90 text-foreground border rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all cursor-pointer ${
            disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/60"
          } ${
            error
              ? "border-red-500/80 focus:ring-2 focus:ring-red-500/20"
              : isOpen
                ? "border-primary ring-2 ring-primary/20"
                : "border-border/80"
          }`}
        >
          <div className="flex items-center gap-2.5 text-left truncate">
            <CalendarIcon size={16} className={value ? "text-primary" : "text-muted-foreground"} />
            <span className={value ? "text-foreground font-semibold" : "text-muted-foreground/80"}>
              {displayFormatted || placeholder}
            </span>
          </div>

          {value && !disabled && (
            <div
              onClick={handleClear}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-800 transition-colors"
              title="Clear date"
            >
              <X size={14} />
            </div>
          )}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 p-4 rounded-2xl bg-card border border-border shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm font-bold text-foreground">
                {MONTH_NAMES[month]} {year}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center">
              {DAY_NAMES.map((d) => (
                <span key={d} className="text-[11px] font-bold text-muted-foreground uppercase">
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((item, idx) => {
                const isSelected = item.dateStr === value
                const isToday = item.dateStr === todayStr

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={item.isDisabled}
                    onClick={() => handleSelectDate(item.dateStr)}
                    className={`h-8 w-full rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      item.isDisabled
                        ? "text-muted-foreground/40 cursor-not-allowed opacity-40"
                        : isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                          : isToday
                            ? "bg-primary/20 text-primary border border-primary/40 font-bold"
                            : item.isCurrentMonth
                              ? "text-foreground hover:bg-muted hover:text-foreground"
                              : "text-muted-foreground/60 hover:bg-muted/50"
                    }`}
                  >
                    {item.dayNum}
                  </button>
                )
              })}
            </div>

            <div className="flex justify-between items-center border-t border-border pt-3 text-xs">
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Today
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("")
                    setIsOpen(false)
                  }}
                  className="text-muted-foreground font-semibold hover:text-foreground cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <span className="text-[11px] text-red-400 font-medium pl-1 text-left">{error}</span>
      )}
    </div>
  )
}
