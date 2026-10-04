import { useMemo } from "react"
import type { DateRangeFilter } from "@/shared/types/analytics.types"
import DatePicker from "@/shared/components/form/DatePicker"
import DataTableToolbar from "@/shared/components/data-table/DataTableToolbar"
import type { SelectFilter, TabConfig } from "@/shared/components/data-table/types"
import { Calendar } from "lucide-react"
import SelectInput from "@/shared/components/form/SelectInput"

export interface DateRangeTabsProps {
  activeRange: DateRangeFilter
  onRangeChange: (range: DateRangeFilter) => void
  selectedYear?: number
  onYearChange?: (year: number) => void
  selectedMonth?: number
  onMonthChange?: (month: number) => void
  startDate?: string
  onStartDateChange?: (date: string) => void
  endDate?: string
  onEndDateChange?: (date: string) => void
  allowCustom?: boolean
  variant?: "pills" | "toolbar"
  className?: string
}

const DASHBOARD_RANGES: { label: string; value: DateRangeFilter }[] = [
  { label: "Today", value: "TODAY" },
  { label: "Last 7 Days", value: "7_DAYS" },
  { label: "This Month", value: "30_DAYS" },
  { label: "This Year", value: "12_MONTHS" },
  { label: "All Years", value: "ALL_YEARS" },
]

const MONTH_OPTIONS = [
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
]

export default function DateRangeTabs({
  activeRange,
  onRangeChange,
  selectedYear = new Date().getFullYear(),
  onYearChange,
  selectedMonth = new Date().getMonth() + 1,
  onMonthChange,
  startDate = "",
  onStartDateChange,
  endDate = "",
  onEndDateChange,
  allowCustom = false,
  variant,
  className = "",
}: DateRangeTabsProps) {
  const currentYear = new Date().getFullYear()

  const availableYears = useMemo(() => {
    const years: number[] = []
    for (let y = 2024; y <= currentYear; y++) {
      years.push(y)
    }
    return years
  }, [currentYear])

  const usePillVariant = variant === "pills" || (!variant && !allowCustom)

  const tabs: TabConfig[] = useMemo(() => {
    const list: TabConfig[] = DASHBOARD_RANGES.map((r) => ({
      id: r.value,
      label: r.label,
    }))
    if (allowCustom) {
      list.push({ id: "CUSTOM", label: "Custom Range" })
    }
    return list
  }, [allowCustom])

  const selectFilters: SelectFilter[] = useMemo(() => {
    const filters: SelectFilter[] = []

    if (activeRange === "12_MONTHS" && onYearChange) {
      filters.push({
        id: "year-filter",
        label: "Select Year",
        value: String(selectedYear),
        onChange: (v) => onYearChange(Number(v)),
        options: availableYears.map((y) => ({ label: String(y), value: String(y) })),
        colSpan: "sm:col-span-1 md:col-span-2",
      })
    }

    if (activeRange === "30_DAYS") {
      if (onMonthChange) {
        filters.push({
          id: "month-filter",
          label: "Select Month",
          value: String(selectedMonth),
          onChange: (v) => onMonthChange(Number(v)),
          options: MONTH_OPTIONS,
          colSpan: "sm:col-span-1 md:col-span-2",
        })
      }
      if (onYearChange) {
        filters.push({
          id: "year-filter",
          label: "Select Year",
          value: String(selectedYear),
          onChange: (v) => onYearChange(Number(v)),
          options: availableYears.map((y) => ({ label: String(y), value: String(y) })),
          colSpan: "sm:col-span-1 md:col-span-2",
        })
      }
    }

    return filters
  }, [activeRange, availableYears, onMonthChange, onYearChange, selectedMonth, selectedYear])

  const todayStr = new Date().toISOString().split("T")[0]

  const extraFilters = useMemo(() => {
    if (activeRange !== "CUSTOM" || !allowCustom) return null

    return (
      <div className="col-span-1 sm:col-span-2 md:col-span-4 flex flex-wrap items-end gap-4 animate-in fade-in duration-200">
        <div className="w-40">
          <DatePicker
            label="Start Date"
            value={startDate}
            maxDate={endDate || todayStr}
            onChange={(d) => onStartDateChange?.(d)}
          />
        </div>
        <div className="w-40">
          <DatePicker
            label="End Date"
            value={endDate}
            minDate={startDate || undefined}
            maxDate={todayStr}
            onChange={(d) => onEndDateChange?.(d)}
          />
        </div>
      </div>
    )
  }, [activeRange, allowCustom, endDate, onEndDateChange, onStartDateChange, startDate, todayStr])

  if (usePillVariant) {
    const rangeOptions = allowCustom
      ? [...DASHBOARD_RANGES, { label: "Custom", value: "CUSTOM" as DateRangeFilter }]
      : DASHBOARD_RANGES

    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        <div className="flex bg-card p-1 rounded-xl border border-border shadow-xs shrink-0">
          {rangeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onRangeChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeRange === opt.value
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {activeRange === "12_MONTHS" && onYearChange && (
          <div className="flex items-center gap-2 shrink-0 animate-in fade-in duration-200 w-36">
            <SelectInput
              value={selectedYear}
              leftIcon={<Calendar className="w-3.5 h-3.5 text-primary" />}
              onChange={(val) => onYearChange(Number(val))}
              options={availableYears.map((y) => ({ label: String(y), value: y }))}
            />
          </div>
        )}

        {activeRange === "30_DAYS" && (
          <div className="flex flex-wrap items-center gap-2 shrink-0 animate-in fade-in duration-200">
            {onMonthChange && (
              <div className="w-36">
                <SelectInput
                  value={selectedMonth}
                  leftIcon={<Calendar className="w-3.5 h-3.5 text-primary" />}
                  onChange={(val) => onMonthChange(Number(val))}
                  options={MONTH_OPTIONS.map((m) => ({
                    label: m.label,
                    value: Number(m.value),
                  }))}
                />
              </div>
            )}

            {onYearChange && (
              <div className="w-28">
                <SelectInput
                  value={selectedYear}
                  onChange={(val) => onYearChange(Number(val))}
                  options={availableYears.map((y) => ({ label: String(y), value: y }))}
                />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <DataTableToolbar
      tabs={tabs}
      activeTab={activeRange}
      onTabChange={(tabId) => onRangeChange(tabId as DateRangeFilter)}
      selectFilters={selectFilters.length > 0 ? selectFilters : undefined}
      extraFilters={extraFilters}
      className={className}
    />
  )
}
