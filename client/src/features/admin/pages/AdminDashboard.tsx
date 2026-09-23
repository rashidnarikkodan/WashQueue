import { useState, useEffect, useCallback } from "react"
import {
  TrendingUp,
  Wallet,
  Building2,
  CalendarCheck,
  Users,
  RefreshCw,
  ChevronRight,
  Sparkles,
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

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<DateRangeFilter>("30_DAYS")
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [trendMetric, setTrendMetric] = useState<"revenue" | "bookings" | "commission">("revenue")

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await analyticsApi.getAdminDashboard(dateRange)
      setData(res)
    } catch {
      toast.error("Failed to load platform analytics data")
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
      id: "gmv",
      label: "Platform GMV",
      value: `₹${(kpis?.totalGrossVolume || 0).toLocaleString()}`,
      variant: "primary",
      icon: TrendingUp,
      description: "Total wash booking transaction value",
      onClick: () => navigate(APP_ROUTES.ADMIN.SETTLEMENTS),
    },
    {
      id: "commission",
      label: "Platform Revenue",
      value: `₹${(kpis?.totalPlatformCommission || 0).toLocaleString()}`,
      variant: "emerald",
      icon: Wallet,
      description: "WashQueue 15% platform take",
      onClick: () => navigate(APP_ROUTES.ADMIN.SETTLEMENTS),
    },
    {
      id: "bookings",
      label: "Total Washes",
      value: (kpis?.totalBookings || 0).toLocaleString(),
      variant: "default",
      icon: CalendarCheck,
      description: `${kpis?.completionRate || 0}% completion across hubs`,
      onClick: () => navigate(APP_ROUTES.ADMIN.BOOKINGS),
    },
    {
      id: "stations",
      label: "Active Stations",
      value: `${kpis?.activeStations || 0} / ${kpis?.totalStations || 0}`,
      variant: "blue",
      icon: Building2,
      description: `${kpis?.pendingApprovals || 0} pending approval`,
      onClick: () => navigate(APP_ROUTES.ADMIN.STATIONS),
    },
    {
      id: "users",
      label: "Platform Users",
      value: (
        (kpis?.totalCustomers || 0) +
        (kpis?.totalOwners || 0) +
        (kpis?.totalManagers || 0)
      ).toLocaleString(),
      variant: "slate",
      icon: Users,
      description: `${kpis?.totalOwners || 0} owners, ${kpis?.totalManagers || 0} managers`,
      onClick: () => navigate(APP_ROUTES.ADMIN.USERS),
    },
  ]

  const userRoleDistribution = [
    { name: "Customers", count: kpis?.totalCustomers || 0 },
    { name: "Station Owners", count: kpis?.totalOwners || 0 },
    { name: "Managers & Staff", count: kpis?.totalManagers || 0 },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Platform Overview & Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              Admin Portal
            </span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Real-time multi-station GMV, booking throughput, network capacity, and financial
            metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
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
        </div>
      </div>

      <StatsHUD stats={statItems} columns={5} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartContainer
            title="Platform Growth & Revenue Timeline"
            subtitle="Historical revenue volume and wash throughput trajectory"
            icon={TrendingUp}
            isLoading={isLoading}
            action={
              <div className="flex items-center gap-1 bg-muted/70 p-0.5 rounded-lg border border-border text-xs">
                <button
                  onClick={() => setTrendMetric("revenue")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    trendMetric === "revenue"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setTrendMetric("bookings")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    trendMetric === "bookings"
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Bookings
                </button>
                <button
                  onClick={() => setTrendMetric("commission")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    trendMetric === "commission"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Commission
                </button>
              </div>
            }
          >
            <RevenueTrendChart
              data={data?.growthTrend || []}
              metricType={trendMetric}
              height={300}
            />
          </ChartContainer>
        </div>

        <div>
          <ChartContainer
            title="Top Performing Stations"
            subtitle="Leading stations ranked by gross booking revenue"
            icon={Building2}
            isLoading={isLoading}
            action={
              <button
                onClick={() => navigate(APP_ROUTES.ADMIN.STATIONS)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <StationComparisonBarChart
              data={data?.topStations || []}
              valueType="revenue"
              height={300}
            />
          </ChartContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ChartContainer
          title="Booking Status Distribution"
          subtitle="Proportion of completed, in-progress, and cancelled washes"
          icon={CalendarCheck}
          isLoading={isLoading}
        >
          <DistributionDonutChart
            data={data?.bookingStatusDistribution || []}
            centerLabel="Bookings"
            centerValue={kpis?.totalBookings || 0}
            height={260}
          />
        </ChartContainer>

        <ChartContainer
          title="User Network Breakdown"
          subtitle="Active customers vs station providers and station managers"
          icon={Users}
          isLoading={isLoading}
        >
          <DistributionDonutChart
            data={userRoleDistribution}
            centerLabel="Accounts"
            centerValue={
              (kpis?.totalCustomers || 0) + (kpis?.totalOwners || 0) + (kpis?.totalManagers || 0)
            }
            height={260}
          />
        </ChartContainer>

        <div className="rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Action Shortcuts</h3>
                <p className="text-xs text-muted-foreground">High priority system tasks</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => navigate(APP_ROUTES.ADMIN.OWNERS)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/80 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-foreground group-hover:text-primary">
                      Owner Onboarding Queue
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {kpis?.pendingApprovals || 0} verification requests pending
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <button
                onClick={() => navigate(APP_ROUTES.ADMIN.SETTLEMENTS)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/80 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-foreground group-hover:text-primary">
                      Financial Settlements
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Audit provider payouts and platform commission
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <button
                onClick={() => navigate(APP_ROUTES.ADMIN.REVIEWS)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/80 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <div>
                    <p className="text-xs font-bold text-foreground group-hover:text-primary">
                      Review Moderation
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {kpis?.openDisputes || 0} flagged customer reviews
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>System Status: Optimal</span>
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
              Recent Platform Transactions & Activity
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live incoming bookings across all registered stations
            </p>
          </div>
          <button
            onClick={() => navigate(APP_ROUTES.ADMIN.BOOKINGS)}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All Bookings <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3">Booking #</th>
                <th className="py-3 px-3">Station</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Amount</th>
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
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted text-foreground border border-border">
                        {b.serviceType}
                      </span>
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
                    No recent booking transactions recorded.
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
