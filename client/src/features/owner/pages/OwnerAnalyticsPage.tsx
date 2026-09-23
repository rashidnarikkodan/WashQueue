import { useState, useEffect, useCallback, useMemo } from "react"
import {
  TrendingUp,
  Wallet,
  Building2,
  RefreshCw,
  Download,
  BarChart3,
  Layers,
  Sparkles,
  ExternalLink,
  CreditCard,
  ReceiptText,
  BadgeIndianRupee,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  analyticsApi,
  type OwnerDashboardData,
  type DateRangeFilter,
} from "@/shared/apis/analytics.api"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import {
  ChartContainer,
  RevenueTrendChart,
  StationComparisonBarChart,
  DistributionDonutChart,
} from "@/shared/components/charts"

const DATE_RANGE_OPTIONS: { label: string; value: DateRangeFilter }[] = [
  { label: "7 Days", value: "7_DAYS" },
  { label: "30 Days", value: "30_DAYS" },
  { label: "90 Days", value: "90_DAYS" },
  { label: "1 Year", value: "YEAR" },
  { label: "All Time", value: "ALL" },
]

export default function OwnerAnalyticsPage() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<DateRangeFilter>("30_DAYS")
  const [selectedStationId, setSelectedStationId] = useState<string>("ALL")
  const [data, setData] = useState<OwnerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [trendMetric, setTrendMetric] = useState<"revenue" | "net" | "commission" | "bookings">(
    "revenue"
  )
  const [compMetric, setCompMetric] = useState<"revenue" | "bookings">("revenue")

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await analyticsApi.getOwnerDashboard(dateRange)
      setData(res)
    } catch {
      toast.error("Failed to load owner financial analytics data")
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchAnalyticsData()
    })
    return () => {
      ignore = true
    }
  }, [fetchAnalyticsData])

  const kpis = data?.kpis
  const totalGross = kpis?.totalGrossRevenue || 0
  const netEarnings = kpis?.netSettlementAmount || Math.round(totalGross * 0.85)
  const platformFee = Math.max(0, totalGross - netEarnings)
  const totalBookings = kpis?.totalBookings || 0
  const avgOrderValue = totalBookings > 0 ? Math.round(totalGross / totalBookings) : 0

  const totalBaysAcrossStations = useMemo(() => {
    return (data?.stations || []).reduce((sum, s) => sum + s.totalBays, 0)
  }, [data?.stations])

  const revenuePerBay =
    totalBaysAcrossStations > 0 ? Math.round(totalGross / totalBaysAcrossStations) : 0

  const filteredStations = useMemo(() => {
    const stations = data?.stations || []
    if (selectedStationId === "ALL") return stations
    return stations.filter((s) => s.stationId === selectedStationId)
  }, [data?.stations, selectedStationId])

  const exportFinancialCSV = () => {
    if (!data?.stations || data.stations.length === 0) {
      toast.error("No financial records to export")
      return
    }

    const headers = [
      "Station Name",
      "City",
      "Configured Bays",
      "Completed Washes",
      "Gross Revenue (INR)",
      "Platform Fee 15% (INR)",
      "Net Payout 85% (INR)",
      "Revenue Per Bay (INR)",
      "Customer Rating",
      "Payout Status",
    ]

    const rows = data.stations.map((s) => {
      const gross = s.totalRevenue || 0
      const fee = Math.round(gross * 0.15)
      const net = gross - fee
      const yieldPerBay = s.totalBays > 0 ? Math.round(gross / s.totalBays) : 0
      return [
        `"${s.name}"`,
        `"${s.city || "Kerala"}"`,
        s.totalBays,
        s.todayBookings,
        gross,
        fee,
        net,
        yieldPerBay,
        s.rating,
        "Settled",
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
      `owner-financial-statement-${dateRange.toLowerCase()}-${Date.now()}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Financial statement exported successfully!")
  }

  const statItems: StatItem[] = [
    {
      id: "owner-gross-revenue",
      label: "Total Gross Billings",
      value: `₹${totalGross.toLocaleString()}`,
      variant: "primary",
      icon: TrendingUp,
      description: "Total invoice volume before deductions",
      onClick: () => navigate(APP_ROUTES.OWNER.FINANCIAL_RECORDS),
    },
    {
      id: "owner-net-earnings",
      label: "Net Take-Home Earnings",
      value: `₹${netEarnings.toLocaleString()}`,
      variant: "emerald",
      icon: Wallet,
      description: "85% net payable after platform fee",
      onClick: () => navigate(APP_ROUTES.OWNER.FINANCIAL_RECORDS),
    },
    {
      id: "owner-platform-fee",
      label: "Platform Fees (15%)",
      value: `₹${platformFee.toLocaleString()}`,
      variant: "amber",
      icon: ReceiptText,
      description: "Payment gateway & tech infra fee",
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
      description: `Across ${totalBaysAcrossStations} active washing bays`,
      onClick: () => navigate(APP_ROUTES.OWNER.STATIONS),
    },
  ]

  const servicePieData = useMemo(() => {
    const list = data?.serviceDistribution || []
    return list.map((sd) => ({
      name: sd.name,
      count: sd.count,
      revenue: sd.revenue,
    }))
  }, [data?.serviceDistribution])

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 rounded-3xl border border-border/80 bg-linear-to-r from-card/90 via-card/60 to-primary/10 backdrop-blur-md shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-primary border border-primary/30 uppercase tracking-wider">
              Financial Intelligence &amp; Earnings
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Settlement
              Ledger
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
            Earnings &amp; Financial Analytics
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 max-w-xl">
            Track gross earnings, net payout disbursements, platform commission deductions, profit
            margins, and per-station financial yield.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch lg:self-auto flex-wrap">
          <div className="relative">
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-card border border-border text-foreground text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="ALL">All Stations Portfolio</option>
              {data?.stations.map((s) => (
                <option key={s.stationId} value={s.stationId}>
                  {s.name} ({s.totalBays} Bays)
                </option>
              ))}
            </select>
          </div>

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
            onClick={fetchAnalyticsData}
            disabled={isLoading}
            title="Refresh financial ledger"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={exportFinancialCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs transition-all cursor-pointer shadow-xs hover:opacity-95"
          >
            <Download className="w-4 h-4" /> Export Financial Statement
          </button>
        </div>
      </div>

      <StatsHUD stats={statItems} columns={5} />

      <div className="rounded-3xl border border-border/80 bg-card/65 backdrop-blur-md p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/70 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">
                Net Settlement &amp; Payout Flow
              </h3>
              <p className="text-xs text-muted-foreground">
                Automated weekly reconciliation and direct bank transfer breakdown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Automated Weekly
              Settlement
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>1. Gross Customer Inflow</span>
              <span className="text-primary font-bold">100%</span>
            </div>
            <p className="text-xl font-black text-foreground">₹{totalGross.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">Aggregate customer booking billing</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>2. Platform Fee Withheld</span>
              <span className="text-amber-500 font-bold">-15%</span>
            </div>
            <p className="text-xl font-black text-amber-500">- ₹{platformFee.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">
              Cloud infra, payment gateway &amp; software
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>3. Net Transferable Payout</span>
              <span className="text-emerald-500 font-bold">85% Take</span>
            </div>
            <p className="text-xl font-black text-emerald-500">₹{netEarnings.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">
              Net disbursed to verified owner bank
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartContainer
            title="Revenue &amp; Net Earnings Trajectory"
            subtitle="Historical timeline of gross sales, net earnings, and platform fees"
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
                  Gross (₹)
                </button>
                <button
                  onClick={() => setTrendMetric("net")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    trendMetric === "net"
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Net Take (₹)
                </button>
                <button
                  onClick={() => setTrendMetric("commission")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    trendMetric === "commission"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Fee (₹)
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
              data={data?.revenueTrend || []}
              metricType={trendMetric}
              height={290}
              onResetRange={() => setDateRange("ALL")}
            />
          </ChartContainer>
        </div>

        <div>
          <ChartContainer
            title="Service Monetization Mix"
            subtitle="Gross revenue contribution by wash package"
            icon={Layers}
            isLoading={isLoading}
          >
            <DistributionDonutChart
              data={servicePieData}
              height={290}
              centerLabel="Gross Revenue"
              centerValue={`₹${totalGross >= 1000 ? `${(totalGross / 1000).toFixed(0)}k` : totalGross}`}
            />
          </ChartContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartContainer
            title="Multi-Station Revenue Benchmark"
            subtitle="Gross income generated across your station locations"
            icon={BarChart3}
            isLoading={isLoading}
            action={
              <div className="flex items-center bg-muted/70 p-1 rounded-lg border border-border text-xs">
                <button
                  onClick={() => setCompMetric("revenue")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    compMetric === "revenue"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Revenue (₹)
                </button>
                <button
                  onClick={() => setCompMetric("bookings")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    compMetric === "bookings"
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Bookings
                </button>
              </div>
            }
          >
            <StationComparisonBarChart
              data={data?.stationComparison || []}
              valueType={compMetric}
              height={280}
            />
          </ChartContainer>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card/65 backdrop-blur-md p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">Unit Economics &amp; Margin</h3>
                <p className="text-xs text-muted-foreground">Portfolio profitability summary</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Average Order Value (AOV)</span>
                <span className="font-bold text-foreground text-sm">
                  ₹{avgOrderValue.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Effective Owner Take-Home</span>
                <span className="font-bold text-emerald-500 text-sm">85.0% Margin</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Average Yield / Wash Bay</span>
                <span className="font-bold text-primary text-sm">
                  ₹{revenuePerBay.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(APP_ROUTES.OWNER.FINANCIAL_RECORDS)}
            className="mt-6 w-full py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-primary/20"
          >
            <span>View Full Settlement Ledger &amp; Invoices</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground uppercase text-[11px] font-bold tracking-wider">
                <th className="pb-3 px-3">Station Name</th>
                <th className="pb-3 px-3">Location</th>
                <th className="pb-3 px-3">Service Bays</th>
                <th className="pb-3 px-3">Washes</th>
                <th className="pb-3 px-3">Gross Billings (₹)</th>
                <th className="pb-3 px-3">Platform Fee (15%)</th>
                <th className="pb-3 px-3 font-bold text-emerald-500">Net Take (85%)</th>
                <th className="pb-3 px-3">Yield / Bay</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredStations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted-foreground">
                    No station financial records found for the active filter.
                  </td>
                </tr>
              ) : (
                filteredStations.map((st) => {
                  const gross = st.totalRevenue || 0
                  const fee = Math.round(gross * 0.15)
                  const net = gross - fee
                  const bayYield = st.totalBays > 0 ? Math.round(gross / st.totalBays) : 0
                  return (
                    <tr key={st.stationId} className="hover:bg-muted/40 transition-colors group">
                      <td className="py-4 px-3 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span>{st.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-muted-foreground">{st.city || "Kerala"}</td>
                      <td className="py-4 px-3">
                        <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/70">
                          {st.totalBays} Bays
                        </span>
                      </td>
                      <td className="py-4 px-3 font-semibold text-foreground">
                        {st.todayBookings}
                      </td>
                      <td className="py-4 px-3 font-bold text-foreground">
                        ₹{gross.toLocaleString()}
                      </td>
                      <td className="py-4 px-3 font-medium text-amber-500">
                        - ₹{fee.toLocaleString()}
                      </td>
                      <td className="py-4 px-3 font-black text-emerald-500">
                        ₹{net.toLocaleString()}
                      </td>
                      <td className="py-4 px-3 font-bold text-primary">
                        ₹{bayYield.toLocaleString()}
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            st.isActive
                              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {st.isActive ? "Settled" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <button
                          onClick={() => navigate(APP_ROUTES.OWNER.FINANCIAL_RECORDS)}
                          className="px-3 py-1.5 rounded-lg bg-card hover:bg-primary hover:text-primary-foreground text-foreground border border-border font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <span>Ledger</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
