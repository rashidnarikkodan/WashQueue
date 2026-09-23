import { useState, useEffect, useCallback, useMemo } from "react"
import {
  TrendingUp,
  Wallet,
  Building2,
  ShieldCheck,
  RefreshCw,
  Download,
  Layers,
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
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import {
  ChartContainer,
  RevenueTrendChart,
  DistributionDonutChart,
} from "@/shared/components/charts"

const DATE_RANGE_OPTIONS: { label: string; value: DateRangeFilter }[] = [
  { label: "7 Days", value: "7_DAYS" },
  { label: "30 Days", value: "30_DAYS" },
  { label: "90 Days", value: "90_DAYS" },
  { label: "1 Year", value: "YEAR" },
  { label: "All Time", value: "ALL" },
]

export default function AdminAnalyticsPage() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<DateRangeFilter>("30_DAYS")
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [trendMetric, setTrendMetric] = useState<"revenue" | "net" | "commission" | "bookings">(
    "revenue"
  )

  const fetchAdminAnalytics = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await analyticsApi.getAdminDashboard(dateRange)
      setData(res)
    } catch {
      toast.error("Failed to load platform financial analytics data")
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchAdminAnalytics()
    })
    return () => {
      ignore = true
    }
  }, [fetchAdminAnalytics])

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

  const statusDonutData = useMemo(() => {
    const list = data?.bookingStatusDistribution || []
    return list.map((st) => ({
      name: st.status.replace(/_/g, " "),
      count: st.count,
      percentage: st.percentage,
    }))
  }, [data?.bookingStatusDistribution])

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 rounded-3xl border border-border/80 bg-linear-to-r from-card/90 via-card/60 to-primary/10 backdrop-blur-md shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-primary border border-primary/30 uppercase tracking-wider">
              Superadmin Financial Intelligence
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ecosystem
              Cashflow
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
            Platform Financial Analytics &amp; Earnings
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 max-w-xl">
            Macro platform GMV tracking, 15% commission revenues, owner payout settlements, unit
            economics, and transaction cashflow.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch lg:self-auto flex-wrap">
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dateRange === opt.value
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAdminAnalytics}
            disabled={isLoading}
            title="Refresh financial data"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={exportFinancialAuditCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs transition-all cursor-pointer shadow-xs hover:opacity-95"
          >
            <Download className="w-4 h-4" /> Export Financial Audit
          </button>
        </div>
      </div>

      <StatsHUD stats={statItems} columns={5} />

      <div className="rounded-3xl border border-border/80 bg-card/65 backdrop-blur-md p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/70 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">
                Ecosystem Cashflow &amp; Payout Waterfall
              </h3>
              <p className="text-xs text-muted-foreground">
                Platform GMV allocation, commission withholdings, and partner disbursements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> T+2 Bank Reconciliation
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>1. Total Platform GMV</span>
              <span className="text-primary font-bold">100% Volume</span>
            </div>
            <p className="text-xl font-black text-foreground">₹{totalGMV.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">Total customer invoices processed</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>2. WashQueue Net Take</span>
              <span className="text-emerald-500 font-bold">15% Take</span>
            </div>
            <p className="text-xl font-black text-emerald-500">
              ₹{platformCommission.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground">Direct platform commission revenue</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>3. Station Owner Settlements</span>
              <span className="text-blue-500 font-bold">85% Disbursed</span>
            </div>
            <p className="text-xl font-black text-blue-500">
              ₹{partnerDisbursements.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground">Transferred to station partners</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartContainer
            title="Platform Monetization &amp; Growth Trajectory"
            subtitle="Historical timeline of gross GMV, commission take, and partner payouts"
            icon={TrendingUp}
            isLoading={isLoading}
            action={
              <div className="flex items-center bg-muted/70 p-1 rounded-lg border border-border text-xs">
                <button
                  onClick={() => setTrendMetric("revenue")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    trendMetric === "revenue"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Gross GMV (₹)
                </button>
                <button
                  onClick={() => setTrendMetric("commission")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    trendMetric === "commission"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Commission (₹)
                </button>
                <button
                  onClick={() => setTrendMetric("net")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    trendMetric === "net"
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Disbursements (₹)
                </button>
                <button
                  onClick={() => setTrendMetric("bookings")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    trendMetric === "bookings"
                      ? "bg-sky-500 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Volume
                </button>
              </div>
            }
          >
            <RevenueTrendChart
              data={data?.growthTrend || []}
              metricType={trendMetric}
              height={300}
              onResetRange={() => setDateRange("ALL")}
            />
          </ChartContainer>
        </div>

        <div>
          <ChartContainer
            title="Booking Lifecycle Breakdown"
            subtitle="Volume and value distribution by order state"
            icon={Layers}
            isLoading={isLoading}
          >
            <DistributionDonutChart
              data={statusDonutData}
              height={300}
              centerLabel="Total Washes"
              centerValue={totalBookings ? String(totalBookings) : undefined}
            />
          </ChartContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-border/80 bg-card/65 backdrop-blur-md p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-lg text-foreground tracking-tight">
                Top Grossing Wash Facilities (Station Financial Rankings)
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground uppercase text-[11px] font-bold tracking-wider">
                  <th className="pb-3 px-3">Rank</th>
                  <th className="pb-3 px-3">Station Name</th>
                  <th className="pb-3 px-3">Location</th>
                  <th className="pb-3 px-3">Washes</th>
                  <th className="pb-3 px-3">Gross GMV (₹)</th>
                  <th className="pb-3 px-3">Commission 15% (₹)</th>
                  <th className="pb-3 px-3 font-bold text-emerald-500">Partner Share (₹)</th>
                  <th className="pb-3 px-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {!data?.topStations || data.topStations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No station transaction records found for this period.
                    </td>
                  </tr>
                ) : (
                  data.topStations.map((st, idx) => {
                    const gmv = st.totalRevenue || 0
                    const comm = Math.round(gmv * 0.15)
                    const partnerShare = gmv - comm
                    return (
                      <tr key={st.stationId} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 px-3">
                          <span
                            className={`font-mono font-bold w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                              idx === 0
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : idx === 1
                                  ? "bg-slate-400/20 text-slate-300 border border-slate-400/40"
                                  : idx === 2
                                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                                    : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span>{st.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-muted-foreground">{st.city || "Kerala"}</td>
                        <td className="py-3.5 px-3 font-semibold text-foreground">
                          {st.totalBookings.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-primary">
                          ₹{gmv.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-amber-500">
                          ₹{comm.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 font-black text-emerald-500">
                          ₹{partnerShare.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-amber-500">
                          ★ {st.rating.toFixed(1)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
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
