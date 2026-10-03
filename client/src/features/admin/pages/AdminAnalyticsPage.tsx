import { useState, useEffect, useCallback, useRef } from "react"
import {
  TrendingUp,
  Wallet,
  Building2,
  ShieldCheck,
  RefreshCw,
  Download,
  ExternalLink,
  ReceiptText,
  BadgeIndianRupee,
  Percent,
  ArrowUpRight,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  analyticsApi,
  type AdminDashboardData,
  type DateRangeFilter,
} from "@/shared/apis/analytics.api"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import DatePicker from "@/shared/components/form/DatePicker"
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import { DataTable, DataTableToolbar } from "@/shared/components/data-table"

type TopStation = NonNullable<AdminDashboardData["topStations"]>[number] & { rank: number }

const DATE_RANGE_OPTIONS: { label: string; value: DateRangeFilter }[] = [
  { label: "Today", value: "TODAY" },
  { label: "7 Days", value: "7_DAYS" },
  { label: "30 Days", value: "30_DAYS" },
  { label: "90 Days", value: "90_DAYS" },
  { label: "1 Year", value: "YEAR" },
  { label: "All Time", value: "ALL" },
  { label: "Custom", value: "CUSTOM" },
]

export default function AdminAnalyticsPage() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<DateRangeFilter>("30_DAYS")
  const [customStartDate, setCustomStartDate] = useState<string>("")
  const [customEndDate, setCustomEndDate] = useState<string>("")
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const cacheRef = useRef<Record<string, AdminDashboardData>>({})

  const fetchAdminAnalytics = useCallback(
    async (targetRange: DateRangeFilter = dateRange, start?: string, end?: string) => {
      setIsRefreshing(true)
      try {
        const res = await analyticsApi.getAdminDashboard(
          targetRange,
          start || customStartDate,
          end || customEndDate
        )
        const cacheKey = `${targetRange}_${start || customStartDate}_${end || customEndDate}`
        cacheRef.current[cacheKey] = res
        setData(res)
      } catch {
        toast.error("Failed to load platform financial analytics data")
      } finally {
        setIsRefreshing(false)
      }
    },
    [dateRange, customStartDate, customEndDate]
  )

  const handleDateRangeChange = (newRange: DateRangeFilter) => {
    if (newRange === dateRange) return
    const key = `${newRange}_${customStartDate}_${customEndDate}`
    const cached = cacheRef.current[key]
    if (cached && newRange !== "CUSTOM") {
      setData(cached)
    }
    setDateRange(newRange)
    if (newRange !== "CUSTOM") {
      setCustomStartDate("")
      setCustomEndDate("")
    }
  }

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      if (dateRange === "CUSTOM" && (!customStartDate || !customEndDate)) {
        setIsLoading(false)
        return
      }

      try {
        const res = await analyticsApi.getAdminDashboard(dateRange, customStartDate, customEndDate)
        if (ignore) return
        const cacheKey = `${dateRange}_${customStartDate}_${customEndDate}`
        cacheRef.current[cacheKey] = res
        setData(res)
      } catch {
        if (!ignore) toast.error("Failed to load platform financial analytics data")
      } finally {
        if (!ignore) setIsLoading(false)
      }
    })
    return () => {
      ignore = true
    }
  }, [dateRange, customStartDate, customEndDate])

  const kpis = data?.kpis
  const totalGMV = kpis?.totalGrossVolume || 0
  const platformCommission = kpis?.totalPlatformCommission || Math.round(totalGMV * 0.15)
  const partnerDisbursements = Math.max(0, totalGMV - platformCommission)
  const totalBookings = kpis?.totalBookings || 0
  const aov = totalBookings > 0 ? Math.round(totalGMV / totalBookings) : 0

  const exportFinancialAuditCSV = () => {
    if (!data?.topStations || data.topStations.length === 0) {
      toast.error("No financial records to export")
      return
    }

    const headers = [
      "Station Name",
      "City",
      "Completed Bookings",
      "Gross GMV (INR)",
      "Platform Take 15% (INR)",
      "Owner Net 85% (INR)",
      "Average Order Value (INR)",
      "Customer Rating",
    ]

    const rows = data.topStations.map((s) => {
      const gmv = s.totalRevenue || 0
      const commission = Math.round(gmv * 0.15)
      const ownerNet = gmv - commission
      const stationAov = s.totalBookings > 0 ? Math.round(gmv / s.totalBookings) : 0
      return [
        `"${s.name}"`,
        `"${s.city || "Kerala"}"`,
        s.totalBookings,
        gmv,
        commission,
        ownerNet,
        stationAov,
        s.rating,
      ]
    })

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `admin-financial-audit-${dateRange.toLowerCase()}-${Date.now()}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Platform financial audit report exported successfully!")
  }

  const statItems: StatItem[] = [
    {
      id: "admin-gmv",
      label: "Platform Gross GMV",
      value: `₹${totalGMV.toLocaleString()}`,
      variant: "primary",
      icon: TrendingUp,
      description: "Total wash transactions processed",
      onClick: () => navigate(APP_ROUTES.ADMIN.SETTLEMENTS),
    },
    {
      id: "admin-commission",
      label: "Platform Net Revenue",
      value: `₹${platformCommission.toLocaleString()}`,
      variant: "emerald",
      icon: Wallet,
      description: "WashQueue 15% commission take",
      onClick: () => navigate(APP_ROUTES.ADMIN.SETTLEMENTS),
    },
    {
      id: "admin-disbursements",
      label: "Partner Disbursements",
      value: `₹${partnerDisbursements.toLocaleString()}`,
      variant: "blue",
      icon: ReceiptText,
      description: "85% net settled to station owners",
      onClick: () => navigate(APP_ROUTES.ADMIN.SETTLEMENTS),
    },
    {
      id: "admin-aov",
      label: "Network Avg Order Value",
      value: `₹${aov.toLocaleString()}`,
      variant: "amber",
      icon: BadgeIndianRupee,
      description: `Across ${totalBookings.toLocaleString()} completed bookings`,
      onClick: () => navigate(APP_ROUTES.ADMIN.BOOKINGS),
    },
    {
      id: "admin-take-rate",
      label: "Platform Take Rate",
      value: "15.0%",
      variant: "default",
      icon: Percent,
      description: "Standard ecosystem commission",
      onClick: () => navigate(APP_ROUTES.ADMIN.SETTINGS),
    },
  ]

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pt-2 space-y-6 min-h-screen text-left animate-in fade-in duration-300">
      <Breadcrumbs
        items={[
          { label: "Admin", path: APP_ROUTES.ADMIN.DASHBOARD },
          { label: "Reports & Analytics" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Platform Financial Analytics &amp; Earnings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            Macro platform GMV tracking, 15% commission revenues, owner payout settlements, unit
            economics, and transaction cashflow
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => fetchAdminAnalytics(dateRange)}
            disabled={isRefreshing || isLoading}
            title="Refresh financial data"
            className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? "animate-spin text-primary" : "text-primary"}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={exportFinancialAuditCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm shadow-xs hover:opacity-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Financial Audit</span>
          </button>
        </div>
      </div>

      <StatsHUD stats={statItems} columns={5} />

      <div className="mb-2 relative z-50">
        <DataTableToolbar
          tabs={DATE_RANGE_OPTIONS.map((opt) => ({
            id: opt.value,
            label: opt.label,
          }))}
          activeTab={dateRange}
          onTabChange={(tabId) => handleDateRangeChange(tabId as DateRangeFilter)}
          extraFilters={
            dateRange === "CUSTOM"
              ? (() => {
                  const today = new Date().toISOString().split("T")[0]
                  return (
                    <>
                      <div className="col-span-1 min-w-[150px]">
                        <DatePicker
                          label="Start Date"
                          value={customStartDate}
                          maxDate={customEndDate || today}
                          onChange={(date) => setCustomStartDate(date)}
                        />
                      </div>
                      <div className="col-span-1 min-w-[150px]">
                        <DatePicker
                          label="End Date"
                          value={customEndDate}
                          minDate={customStartDate || undefined}
                          maxDate={today}
                          onChange={(date) => setCustomEndDate(date)}
                        />
                      </div>
                    </>
                  )
                })()
              : null
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-border/80 bg-card/65 backdrop-blur-md p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-lg text-foreground tracking-tight">
                Top 3 Grossing Wash Facilities (Station Financial Rankings)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Highest grossing facilities by transaction volume and commission contribution
              </p>
            </div>
            <button
              onClick={() => navigate(APP_ROUTES.ADMIN.STATIONS)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All Stations</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <DataTable
            variant="widget"
            columns={[
              {
                id: "rank",
                header: "Rank",
                cell: (st: TopStation) => (
                  <span
                    className={`font-mono font-bold w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                      st.rank === 0
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : st.rank === 1
                          ? "bg-slate-400/20 text-slate-300 border border-slate-400/40"
                          : st.rank === 2
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {st.rank + 1}
                  </span>
                ),
              },
              {
                id: "name",
                header: "Station Name",
                cell: (st: TopStation) => (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="font-bold text-foreground">{st.name}</span>
                  </div>
                ),
              },
              {
                id: "city",
                header: "Location",
                cell: (st: TopStation) => (
                  <span className="text-muted-foreground">{st.city || "Kerala"}</span>
                ),
              },
              {
                id: "washes",
                header: "Washes",
                cell: (st: TopStation) => (
                  <span className="font-semibold text-foreground">
                    {st.totalBookings.toLocaleString()}
                  </span>
                ),
              },
              {
                id: "gross",
                header: "Gross GMV (₹)",
                cell: (st: TopStation) => (
                  <span className="font-bold text-primary">
                    ₹{(st.totalRevenue || 0).toLocaleString()}
                  </span>
                ),
              },
              {
                id: "commission",
                header: "Commission 15% (₹)",
                cell: (st: TopStation) => (
                  <span className="font-bold text-amber-500">
                    ₹{Math.round((st.totalRevenue || 0) * 0.15).toLocaleString()}
                  </span>
                ),
              },
              {
                id: "partner",
                header: "Partner Share (₹)",
                cell: (st: TopStation) => {
                  const gmv = st.totalRevenue || 0
                  const comm = Math.round(gmv * 0.15)
                  const partnerShare = gmv - comm
                  return (
                    <span className="font-black text-emerald-500">
                      ₹{partnerShare.toLocaleString()}
                    </span>
                  )
                },
              },
              {
                id: "rating",
                header: "Rating",
                cell: (st: TopStation) => (
                  <span className="font-bold text-amber-500">★ {st.rating.toFixed(1)}</span>
                ),
              },
            ]}
            data={(data?.topStations || []).slice(0, 3).map((st, idx) => ({ ...st, rank: idx }))}
            rowKey={(st) => st.stationId}
            emptyMessage="No station transaction records found for this period."
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card/65 backdrop-blur-md p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">
                    Settlement Risk &amp; Integrity
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Payout verification &amp; dispute metrics
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">
                    Pending Station Onboarding
                  </span>
                  <span className="font-bold text-amber-500 text-sm">
                    {kpis?.pendingApprovals || 0} Pending
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Open Financial Disputes</span>
                  <span className="font-bold text-foreground text-sm">
                    {kpis?.openDisputes || 0} Open
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Wash Fulfillment Rate</span>
                  <span className="font-bold text-emerald-500 text-sm">
                    {kpis?.completionRate || 0}%
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(APP_ROUTES.ADMIN.SETTLEMENTS)}
              className="mt-6 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs hover:opacity-90 cursor-pointer"
            >
              <span>Inspect Settlement Ledgers &amp; Transfers</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
