import { useState, useEffect, useCallback } from "react"
import {
  Clock,
  TrendingUp,
  RefreshCw,
  QrCode,
  UserPlus,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Star,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { analyticsApi, type ManagerDashboardData } from "@/shared/apis/analytics.api"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import {
  ChartContainer,
  RevenueTrendChart,
  HourlyTrafficBarChart,
  LiveBayMonitor,
} from "@/shared/components/charts"

export default function ManagerDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<ManagerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await analyticsApi.getManagerDashboard()
      setData(res)
    } catch {
      toast.error("Failed to load station operations data")
    } finally {
      setIsLoading(false)
    }
  }, [])

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
  const station = data?.station

  const statItems: StatItem[] = [
    {
      id: "scheduled",
      label: "Today's Schedule",
      value: (kpis?.todayTotalScheduled || 0).toLocaleString(),
      variant: "primary",
      icon: Clock,
      description: `${kpis?.todayCompleted || 0} completed washes`,
      onClick: () => navigate(APP_ROUTES.MANAGER.QUEUES),
    },
    {
      id: "occupancy",
      label: "Bay Occupancy",
      value: `${kpis?.bayOccupancyRate || 0}%`,
      variant: "emerald",
      icon: TrendingUp,
      description: `${kpis?.todayInService || 0} currently washing`,
    },
    {
      id: "daily-revenue",
      label: "Today's Gross",
      value: `₹${(kpis?.todayRevenue || 0).toLocaleString()}`,
      variant: "blue",
      icon: TrendingUp,
      description: "Day-to-date transaction intake",
    },
    {
      id: "turnaround",
      label: "Avg Service Duration",
      value: `${kpis?.averageServiceMinutes || 35} mins`,
      variant: "slate",
      icon: Clock,
      description: "Per completed vehicle wash",
    },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl border border-border/80 bg-linear-to-r from-card/80 via-card/50 to-primary/10 backdrop-blur-sm shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {station?.name || "Assigned Wash Station"}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30">
              Manager Floor
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary" /> {station?.city || "Kerala Hub"}
            </span>
            <span>•</span>
            <span className="font-mono font-bold text-foreground">
              {station?.totalBays || 1} Bays Available
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-500" /> {(station?.rating || 5.0).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            title="Refresh live status"
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => navigate(APP_ROUTES.MANAGER.CHECK_IN)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-90 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" /> QR Check-In
          </button>

          <button
            onClick={() => navigate(APP_ROUTES.MANAGER.WALK_INS)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-xs font-bold transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-500" /> Walk-In Entry
          </button>
        </div>
      </div>

      <StatsHUD stats={statItems} columns={4} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Live Bay Occupancy Monitor</h2>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Status
            </span>
          </div>
          <button
            onClick={() => navigate(APP_ROUTES.MANAGER.QUEUES)}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            Full Queue Board <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <LiveBayMonitor
          bays={data?.bayStates || []}
          onBayAction={() => navigate(APP_ROUTES.MANAGER.QUEUES)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Today's Hourly Traffic & Peak Hours"
          subtitle="Customer volume spread from opening to closing"
          icon={Clock}
          isLoading={isLoading}
        >
          <HourlyTrafficBarChart data={data?.hourlyTrafficToday || []} height={250} />
        </ChartContainer>

        <ChartContainer
          title="Weekly Wash Volume"
          subtitle="Past 7 days throughput comparison"
          icon={TrendingUp}
          isLoading={isLoading}
        >
          <RevenueTrendChart data={data?.weeklyVolume || []} metricType="bookings" height={250} />
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                Upcoming Queue Schedule
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Vehicles arriving today for service
              </p>
            </div>
            <button
              onClick={() => navigate(APP_ROUTES.MANAGER.QUEUES)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              Manage Queue <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Slot Time</th>
                  <th className="py-2.5 px-3">Vehicle #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Wash Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data?.upcomingQueue && data.upcomingQueue.length > 0 ? (
                  data.upcomingQueue.map((q) => (
                    <tr key={q.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-foreground whitespace-nowrap">
                        {new Date(q.windowStart).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-foreground uppercase">
                        {q.vehiclePlate}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{q.customerName}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted text-foreground border border-border">
                          {q.serviceType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            q.status === "CHECKED_IN"
                              ? "bg-primary/15 text-primary"
                              : q.status === "IN_SERVICE"
                                ? "bg-amber-500/15 text-amber-500"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => navigate(APP_ROUTES.MANAGER.QUEUES)}
                          className="px-2.5 py-1 rounded-lg bg-primary hover:opacity-90 text-primary-foreground font-semibold text-[11px] transition-all cursor-pointer"
                        >
                          Process
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No vehicles in the upcoming queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Station Alerts</h3>
                <p className="text-xs text-muted-foreground">
                  Operational issues requiring attention
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {data?.activeIssues && data.activeIssues.length > 0 ? (
                data.activeIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-xl bg-card border border-border/70 flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{issue.title}</p>
                      <p className="text-[11px] text-muted-foreground">#{issue.issueNumber}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 uppercase">
                      {issue.priority}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <span className="text-emerald-500 font-bold block mb-1">All Clear</span>
                  No equipment flags or customer disputes pending.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate(APP_ROUTES.MANAGER.FEEDBACK)}
            className="mt-4 w-full py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-all cursor-pointer border border-border"
          >
            Review Customer Feedback
          </button>
        </div>
      </div>
    </div>
  )
}
