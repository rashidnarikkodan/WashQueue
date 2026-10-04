import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  TrendingUp,
  Wallet,
  Building2,
  RefreshCw,
  Download,
  CreditCard,
  ReceiptText,
  BadgeIndianRupee,
  ArrowUpRight,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  analyticsApi,
  type OwnerDashboardData,
  type OwnerStationSummary,
  type DateRangeFilter,
} from "@/shared/apis/analytics.api"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import { DataTable } from "@/shared/components/data-table"

import DateRangeTabs from "@/shared/components/analytics/DateRangeTabs"
import SelectInput from "@/shared/components/form/SelectInput"

export default function OwnerAnalyticsPage() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<DateRangeFilter>("30_DAYS")
  const [selectedStationId, setSelectedStationId] = useState<string>("ALL")
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [customStartDate, setCustomStartDate] = useState<string>("")
  const [customEndDate, setCustomEndDate] = useState<string>("")
  const [data, setData] = useState<OwnerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const cacheRef = useRef<Record<string, OwnerDashboardData>>({})

  const fetchAnalyticsData = useCallback(
    async (
      targetRange: DateRangeFilter = dateRange,
      targetStation: string = selectedStationId,
      year: number = selectedYear,
      month: number = selectedMonth,
      start?: string,
      end?: string
    ) => {
      setIsRefreshing(true)
      try {
        const res = await analyticsApi.getOwnerDashboard(
          targetRange,
          targetStation,
          year,
          month,
          start || customStartDate,
          end || customEndDate
        )
        const cacheKey = `${targetRange}_${targetStation}_${year}_${month}_${start || customStartDate}_${end || customEndDate}`
        cacheRef.current[cacheKey] = res
        setData(res)
      } catch {
        toast.error("Failed to load owner financial analytics data")
      } finally {
        setIsRefreshing(false)
      }
    },
    [dateRange, selectedStationId, selectedYear, selectedMonth, customStartDate, customEndDate]
  )

  const handleDateRangeChange = (newRange: DateRangeFilter) => {
    if (newRange === dateRange) return
    setDateRange(newRange)
    if (newRange !== "CUSTOM") {
      setCustomStartDate("")
      setCustomEndDate("")
    }
  }

  const handleStationChange = (newStationId: string) => {
    if (newStationId === selectedStationId) return
    setSelectedStationId(newStationId)
  }

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      if (dateRange === "CUSTOM" && (!customStartDate || !customEndDate)) {
        setIsLoading(false)
        return
      }

      const cacheKey = `${dateRange}_${selectedStationId}_${selectedYear}_${selectedMonth}_${customStartDate}_${customEndDate}`
      try {
        const res = await analyticsApi.getOwnerDashboard(
          dateRange,
          selectedStationId,
          selectedYear,
          selectedMonth,
          customStartDate,
          customEndDate
        )
        if (ignore) return
        cacheRef.current[cacheKey] = res
        setData(res)
      } catch {
        if (!ignore) toast.error("Failed to load owner financial analytics data")
      } finally {
        if (!ignore) setIsLoading(false)
      }
    })
    return () => {
      ignore = true
    }
  }, [dateRange, selectedStationId, selectedYear, selectedMonth, customStartDate, customEndDate])

  const kpis = data?.kpis
  const totalGross = kpis?.totalGrossRevenue || 0
  const netEarnings = kpis?.netSettlementAmount ?? 0
  const platformFee = Math.max(0, totalGross - netEarnings)
  const totalBookings = kpis?.totalBookings || 0
  const avgOrderValue = totalBookings > 0 ? Math.round(totalGross / totalBookings) : 0

  const selectedStationObj = useMemo(() => {
    if (selectedStationId === "ALL") return null
    return (data?.stations || []).find((s) => s.stationId === selectedStationId)
  }, [data?.stations, selectedStationId])

  const totalBaysAcrossStations = useMemo(() => {
    if (selectedStationObj) {
      return selectedStationObj.totalBays
    }
    return (data?.stations || []).reduce((sum, s) => sum + s.totalBays, 0)
  }, [data?.stations, selectedStationObj])

  const revenuePerBay =
    totalBaysAcrossStations > 0 ? Math.round(totalGross / totalBaysAcrossStations) : 0

  const filteredStations = useMemo(() => {
    const stations = data?.stations || []
    if (selectedStationId === "ALL") return stations
    return stations.filter((s) => s.stationId === selectedStationId)
  }, [data?.stations, selectedStationId])

  const exportFinancialCSV = async () => {
    setIsRefreshing(true)
    try {
      if (dateRange === "CUSTOM" && (!customStartDate || !customEndDate)) {
        toast.error("Please select start and end dates to export custom range")
        return
      }
      const blob = await analyticsApi.exportOwnerAnalytics(
        dateRange,
        selectedStationId,
        selectedYear,
        selectedMonth,
        customStartDate,
        customEndDate
      )

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute(
        "download",
        `owner-financial-statement-${dateRange.toLowerCase()}-${Date.now()}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("Financial statement exported successfully!")
    } catch {
      toast.error("Failed to export financial statement")
    } finally {
      setIsRefreshing(false)
    }
  }

  const statItems: StatItem[] = [
    {
      id: "owner-gross-revenue",
      label: "Total Gross Billings",
      value: `₹${totalGross.toLocaleString()}`,
      variant: "primary",
      icon: TrendingUp,
      description: selectedStationObj
        ? `Total billings at ${selectedStationObj.name}`
        : "Total invoice volume before deductions",
      onClick: () => navigate(APP_ROUTES.OWNER.FINANCIAL_RECORDS),
    },
    {
      id: "owner-net-earnings",
      label: "Net Take-Home Earnings",
      value: `₹${netEarnings.toLocaleString()}`,
      variant: "emerald",
      icon: Wallet,
      description: "Actual take-home earnings",
      onClick: () => navigate(APP_ROUTES.OWNER.FINANCIAL_RECORDS),
    },
    {
      id: "owner-platform-fee",
      label: "Platform Fees",
      value: `₹${platformFee.toLocaleString()}`,
      variant: "amber",
      icon: ReceiptText,
      description: "Actual fees deducted",
      onClick: () => navigate(APP_ROUTES.OWNER.FINANCIAL_RECORDS),
    },
    {
      id: "owner-aov",
      label: "Average Ticket Size (AOV)",
      value: `₹${avgOrderValue.toLocaleString()}`,
      variant: "blue",
      icon: BadgeIndianRupee,
      description: `Across ${totalBookings.toLocaleString()} completed washes`,
      onClick: () => navigate(APP_ROUTES.OWNER.BOOKINGS),
    },
    {
      id: "owner-yield-bay",
      label: "Financial Yield / Bay",
      value: `₹${revenuePerBay.toLocaleString()}`,
      variant: "default",
      icon: CreditCard,
      description: selectedStationObj
        ? `Across ${totalBaysAcrossStations} configured bay${totalBaysAcrossStations === 1 ? "" : "s"}`
        : `Across ${totalBaysAcrossStations} active washing bays across portfolio`,
      onClick: () => navigate(APP_ROUTES.OWNER.STATIONS),
    },
  ]

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pt-2 pb-16 space-y-6 min-h-screen text-left animate-in fade-in duration-300">
      <Breadcrumbs
        items={[{ label: "Owner", path: APP_ROUTES.OWNER.DASHBOARD }, { label: "Analytics" }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Earnings &amp; Financial Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            Track gross earnings, net payout disbursements, platform commission deductions, profit
            margins, and per-station financial yield
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => fetchAnalyticsData(dateRange, selectedStationId)}
            disabled={isRefreshing || isLoading}
            title="Refresh financial ledger"
            className="px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : "text-primary"}`}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={exportFinancialCSV}
            className="flex items-center gap-2 font-semibold px-4.5 py-2.5 rounded-xl transition-all shadow-md select-none bg-primary hover:opacity-90 text-primary-foreground hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-xs sm:text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      <StatsHUD stats={statItems} columns={5} />

      <DateRangeTabs
        activeRange={dateRange}
        onRangeChange={handleDateRangeChange}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        startDate={customStartDate}
        onStartDateChange={setCustomStartDate}
        endDate={customEndDate}
        onEndDateChange={setCustomEndDate}
        allowCustom={true}
      />

      <div className="flex items-center gap-2 shrink-0 min-w-[220px]">
        <SelectInput
          label="Filter Station"
          value={selectedStationId}
          onChange={(val) => handleStationChange(val)}
          options={[
            { label: "All Stations Portfolio", value: "ALL" },
            ...(data?.stations || []).map((s) => ({
              label: `${s.name} (${s.totalBays} Bays)`,
              value: s.stationId,
            })),
          ]}
        />
      </div>

      <div className="rounded-3xl border border-border/80 bg-card/65 backdrop-blur-md p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h3 className="font-bold text-lg text-foreground tracking-tight">
              Station Financial Performance Ledger
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Individual station breakdown including gross sales, platform deductions, net earnings,
              and bay yields
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            {filteredStations.length} Station{filteredStations.length === 1 ? "" : "s"} Monitored
          </span>
        </div>

        <DataTable
          variant="widget"
          columns={[
            {
              id: "name",
              header: "Station Name",
              cell: (st: OwnerStationSummary) => (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="font-bold text-foreground">{st.name}</span>
                </div>
              ),
            },
            {
              id: "location",
              header: "Location",
              cell: (st: OwnerStationSummary) => (
                <span className="text-muted-foreground">{st.city || "Kerala"}</span>
              ),
            },
            {
              id: "bays",
              header: "Service Bays",
              cell: (st: OwnerStationSummary) => (
                <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/70">
                  {st.totalBays} Bays
                </span>
              ),
            },
            {
              id: "washes",
              header: "Washes",
              cell: (st: OwnerStationSummary) => (
                <span className="font-semibold text-foreground">{st.todayBookings}</span>
              ),
            },
            {
              id: "gross",
              header: "Gross Billings (₹)",
              cell: (st: OwnerStationSummary) => (
                <span className="font-bold text-foreground">
                  ₹{(st.totalRevenue || 0).toLocaleString()}
                </span>
              ),
            },
            {
              id: "fee",
              header: "Platform Fee",
              cell: () => (
                <span className="text-muted-foreground text-xs italic">See account total</span>
              ),
            },
            {
              id: "net",
              header: "Net Take",
              cell: () => (
                <span className="text-muted-foreground text-xs italic">Pending settlement</span>
              ),
            },
            {
              id: "yield",
              header: "Yield / Bay",
              cell: (st: OwnerStationSummary) => {
                const yieldBay =
                  st.totalBays > 0 ? Math.round((st.totalRevenue || 0) / st.totalBays) : 0
                return <span className="font-bold text-primary">₹{yieldBay.toLocaleString()}</span>
              },
            },
            {
              id: "status",
              header: "Status",
              cell: (st: OwnerStationSummary) => (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    st.isActive
                      ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {st.isActive ? "Settled" : "Inactive"}
                </span>
              ),
            },
            {
              id: "actions",
              header: "Actions",
              align: "right",
              cell: () => (
                <button
                  onClick={() => navigate(APP_ROUTES.OWNER.FINANCIAL_RECORDS)}
                  className="px-3 py-1.5 rounded-lg bg-card hover:bg-primary hover:text-primary-foreground text-foreground border border-border font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ml-auto"
                >
                  <span>Ledger</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              ),
            },
          ]}
          data={filteredStations}
          rowKey={(st) => st.stationId}
          emptyMessage="No station financial records found for the active filter."
        />
      </div>
    </div>
  )
}
