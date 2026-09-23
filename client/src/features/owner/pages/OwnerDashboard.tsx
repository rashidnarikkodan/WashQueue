import { useState, useEffect, useCallback } from "react"
import {
  TrendingUp,
  Wallet,
  Building2,
  CalendarCheck,
  Star,
  RefreshCw,
  Plus,
  ChevronRight,
  ExternalLink,
  Sparkles,
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

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<DateRangeFilter>("30_DAYS")
  const [data, setData] = useState<OwnerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [compMetric, setCompMetric] = useState<"revenue" | "bookings">("revenue")

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await analyticsApi.getOwnerDashboard(dateRange)
      setData(res)
    } catch {
      toast.error("Failed to load owner dashboard data")
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchDashboardData()
    })
    return () => {
      ignore = true
    }
  }, [fetchDashboardData])

  const kpis = data?.kpis

  const statItems: StatItem[] = [
    {
      id: "revenue",
      label: "Total Gross Revenue",
      value: `₹${(kpis?.totalGrossRevenue || 0).toLocaleString()}`,
      variant: "primary",
      icon: TrendingUp,
      description: "Gross booking volume across all stations",
      onClick: () => navigate(APP_ROUTES.OWNER.FINANCIAL_RECORDS),
    },
    {
      id: "net-earnings",
      label: "Net Earnings",
      value: `₹${(kpis?.netSettlementAmount || 0).toLocaleString()}`,
      variant: "emerald",
      icon: Wallet,
      description: "85% payout after platform fee",
      onClick: () => navigate(APP_ROUTES.OWNER.FINANCIAL_RECORDS),
    },
    {
      id: "bookings",
      label: "Total Bookings",
      value: (kpis?.totalBookings || 0).toLocaleString(),
      variant: "default",
      icon: CalendarCheck,
      description: `${kpis?.completionRate || 0}% wash completion rate`,
      onClick: () => navigate(APP_ROUTES.OWNER.BOOKINGS),
    },
    {
      id: "stations",
      label: "Wash Stations",
      value: `${kpis?.activeStations || 0} / ${kpis?.totalStations || 0}`,
      variant: "blue",
      icon: Building2,
      description: `${kpis?.totalManagers || 0} assigned managers`,
      onClick: () => navigate(APP_ROUTES.OWNER.STATIONS),
    },
    {
      id: "rating",
      label: "Portfolio Rating",
      value: `★ ${(kpis?.averageRating || 5.0).toFixed(1)}`,
      variant: "amber",
      icon: Star,
      description: "Average customer review score",
      onClick: () => navigate(APP_ROUTES.OWNER.FEEDBACK),
    },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Station Owner Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              Provider Hub
            </span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Aggregated revenue analytics, station utilization, staff coordination, and booking flow.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          <div className="flex bg-muted/60 p-1 rounded-xl border border-border">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  dateRange === opt.value
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            title="Refresh analytics data"
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => navigate("/owner/stations/new")}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-90 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Station
          </button>
        </div>
      </div>

      <StatsHUD stats={statItems} columns={5} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartContainer
            title="Station Performance & Volume Comparison"
            subtitle="Side-by-side revenue and booking throughput across all your locations"
            icon={Building2}
            isLoading={isLoading}
            action={
              <div className="flex items-center gap-1 bg-muted/70 p-0.5 rounded-lg border border-border text-xs">
                <button
                  onClick={() => setCompMetric("revenue")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    compMetric === "revenue"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setCompMetric("bookings")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
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
              height={300}
              onAddStation={() => navigate("/owner/stations/new")}
            />
          </ChartContainer>
        </div>

        <div>
          <ChartContainer
            title="Popular Service Mix"
            subtitle="Distribution of wash types & packages booked"
            icon={Sparkles}
            isLoading={isLoading}
          >
            <DistributionDonutChart
              data={data?.serviceDistribution || []}
              centerLabel="Washes"
              centerValue={kpis?.totalBookings || 0}
              height={300}
            />
          </ChartContainer>
        </div>
      </div>

      <ChartContainer
        title="Multi-Station Revenue Trend"
        subtitle="Historical financial inflow across all managed stations"
        icon={TrendingUp}
        isLoading={isLoading}
      >
        <RevenueTrendChart
          data={data?.revenueTrend || []}
          metricType="revenue"
          height={260}
          onResetRange={() => setDateRange("ALL")}
        />
      </ChartContainer>

      <div className="rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
              My Stations Status & Live Summary
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live operational health and today's volume per station
            </p>
          </div>
          <button
            onClick={() => navigate(APP_ROUTES.OWNER.STATIONS)}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            Manage Stations <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3">Station Name</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Bays</th>
                <th className="py-3 px-3">Today's Queue</th>
                <th className="py-3 px-3">Gross Revenue</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3">Manager</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data?.stations && data.stations.length > 0 ? (
                data.stations.map((s) => (
                  <tr key={s.stationId} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-foreground">{s.name}</td>
                    <td className="py-3 px-3 text-muted-foreground">{s.city || "—"}</td>
                    <td className="py-3 px-3 font-mono font-medium text-foreground">
                      {s.totalBays} Bays
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-primary">{s.todayBookings} washes</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground">
                      ₹{s.totalRevenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-amber-500 font-semibold">
                      ★ {s.rating.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {s.assignedManagerName || (
                        <span className="text-amber-500/80 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          s.isActive
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.isActive ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/owner/stations/${s.stationId}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold text-[11px] transition-all cursor-pointer border border-border"
                      >
                        Details <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No wash stations found. Click "Add Station" to register your first location.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
              Recent Bookings Across Stations
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live customer wash reservations across your business network
            </p>
          </div>
          <button
            onClick={() => navigate(APP_ROUTES.OWNER.BOOKINGS)}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            All Bookings <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3">Booking #</th>
                <th className="py-3 px-3">Station</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Gross Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data?.recentBookings && data.recentBookings.length > 0 ? (
                data.recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-foreground">
                      {b.bookingNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-foreground">{b.stationName}</td>
                    <td className="py-3 px-3 text-muted-foreground">{b.customerName}</td>
                    <td className="py-3 px-3 font-mono text-muted-foreground uppercase">
                      {b.vehiclePlate}
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground">
                      ₹{b.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          b.status === "COMPLETED"
                            ? "bg-emerald-500/15 text-emerald-500"
                            : b.status === "IN_SERVICE"
                              ? "bg-primary/15 text-primary"
                              : b.status === "CANCELLED"
                                ? "bg-rose-500/15 text-rose-500"
                                : "bg-amber-500/15 text-amber-500"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground whitespace-nowrap">
                      {new Date(b.createdAt).toLocaleDateString()}{" "}
                      {new Date(b.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No bookings logged yet for your stations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
