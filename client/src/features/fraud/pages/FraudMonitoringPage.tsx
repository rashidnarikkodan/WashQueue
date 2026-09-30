import { useState, useCallback, useMemo, useEffect } from "react"
import { Download, RefreshCw, Shield, AlertTriangle, ScrollText } from "lucide-react"
import { toast } from "sonner"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"
import { fraudApi } from "@/shared/apis/fraud.api"
import { FraudStatsGrid } from "../components/FraudStatsGrid"
import { InvestigateFraudModal } from "../components/InvestigateFraudModal"
import { RiskLevelBadge, FraudStatusBadge, ActorRoleBadge } from "../components/FraudBadges"
import {
  DataTable,
  DataTableToolbar,
  type Column,
  type TabConfig,
  type SelectFilter,
} from "@/shared/components/data-table"
import type { PaginationMeta } from "@/shared/components/ui/Pagination"
import type {
  FraudEventDto,
  FraudMetricsDto,
  FraudEventStatus,
  RiskLevel,
  ActorType,
  WatchlistUser,
  SecurityAuditLog,
} from "../types/fraud.types"

const STATUS_TABS: TabConfig[] = [
  { id: "ALL", label: "All Alerts" },
  { id: "OPEN", label: "Open" },
  { id: "REVIEWING", label: "In Review" },
  { id: "RESOLVED", label: "Resolved" },
  { id: "DISMISSED", label: "Dismissed" },
]

export default function FraudMonitoringPage() {
  const [activeView, setActiveView] = useState<"alerts" | "watchlist" | "logs">("alerts")
  const [timeRange, setTimeRange] = useState<"Today" | "7 days" | "30 days">("7 days")

  const [metrics, setMetrics] = useState<FraudMetricsDto | null>(null)
  const [alerts, setAlerts] = useState<FraudEventDto[]>([])
  const [totalAlerts, setTotalAlerts] = useState(0)
  const [watchlist, setWatchlist] = useState<WatchlistUser[]>([])
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLog[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [riskLevelFilter, setRiskLevelFilter] = useState("ALL")
  const [actorTypeFilter, setActorTypeFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  const [watchlistSearch, setWatchlistSearch] = useState("")
  const [watchlistRoleFilter, setWatchlistRoleFilter] = useState("ALL")
  const [watchlistPage, setWatchlistPage] = useState(1)

  const [logsSearch, setLogsSearch] = useState("")
  const [logsSeverityFilter, setLogsSeverityFilter] = useState("ALL")
  const [logsPage, setLogsPage] = useState(1)

  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [investigatingEvent, setInvestigatingEvent] = useState<FraudEventDto | null>(null)

  const loadData = useCallback(
    async (signal?: { cancelled: boolean }) => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const now = new Date()
        let startDate: Date | undefined
        if (timeRange === "Today") {
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        } else if (timeRange === "7 days") {
          startDate = new Date(now.getTime() - 7 * 86400 * 1000)
        } else if (timeRange === "30 days") {
          startDate = new Date(now.getTime() - 30 * 86400 * 1000)
        }

        const [metricsRes, eventsRes, watchlistRes, logsRes] = await Promise.all([
          fraudApi
            .getMetrics(startDate ? { startDate: startDate.toISOString() } : undefined)
            .catch(() => null),
          fraudApi
            .listEvents({
              page: currentPage,
              limit: pageSize,
              status: statusFilter !== "ALL" ? (statusFilter as FraudEventStatus) : undefined,
              riskLevel: riskLevelFilter !== "ALL" ? (riskLevelFilter as RiskLevel) : undefined,
              actorType: actorTypeFilter !== "ALL" ? actorTypeFilter : undefined,
              search: searchQuery.trim() || undefined,
              startDate: startDate ? startDate.toISOString() : undefined,
            })
            .catch(() => null),
          fraudApi.getWatchlist().catch(() => []),
          fraudApi.getSecurityLogs().catch(() => []),
        ])

        if (signal?.cancelled) return

        if (metricsRes) {
          setMetrics(metricsRes)
        }

        if (eventsRes) {
          setAlerts(eventsRes.items || [])
          setTotalAlerts(eventsRes.total || 0)
        } else {
          setAlerts([])
          setTotalAlerts(0)
        }

        setWatchlist(watchlistRes || [])
        setSecurityLogs(logsRes || [])
      } catch {
        if (!signal?.cancelled) {
          setLoadError("Failed to synchronize fraud records from server")
        }
      } finally {
        if (!signal?.cancelled) {
          setIsLoading(false)
        }
      }
    },
    [timeRange, currentPage, pageSize, statusFilter, riskLevelFilter, actorTypeFilter, searchQuery]
  )

  useEffect(() => {
    const signal = { cancelled: false }
    void (async () => {
      await loadData(signal)
    })()
    return () => {
      signal.cancelled = true
    }
  }, [loadData])

  const handleUpdateStatus = async (
    id: string,
    action: "REVIEW" | "RESOLVE" | "DISMISS",
    notes?: string
  ) => {
    try {
      await fraudApi.updateEventStatus(id, action, notes)
      toast.success(`Event status updated to ${action}`)
      await loadData()
    } catch {
      toast.error("Failed to update status on server")
    }
  }

  const handleExportLogs = () => {
    const dataToExport = alerts.map((a) => ({
      AuditID: a.id || a._id,
      UserID: a.userId,
      Role: a.actorType,
      Entity: `${a.entityType}:${a.entityId}`,
      EventType: a.eventType,
      RiskScore: a.riskScore,
      Severity: a.riskLevel,
      Status: a.status,
      Reason: a.reason,
      CreatedAt: a.createdAt,
    }))

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", jsonString)
    downloadAnchor.setAttribute(
      "download",
      `fraud_security_logs_${new Date().toISOString().slice(0, 10)}.json`
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success("Security logs exported successfully")
  }

  const paginationMeta: PaginationMeta = useMemo(() => {
    const totalPages = Math.ceil(totalAlerts / pageSize) || 1
    return {
      total: totalAlerts,
      page: currentPage,
      limit: pageSize,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    }
  }, [totalAlerts, currentPage, pageSize])

  const alertColumns: Column<FraudEventDto>[] = useMemo(
    () => [
      {
        id: "incident",
        header: "Incident / Rule",
        cell: (row) => {
          const ruleCode = row.signals[0]?.code
            ? row.signals[0].code.replace(/^(CUST_|BOOKING_|OPS_|ACCT_)/, "").replace(/_/g, " ")
            : row.eventType.replace(/_/g, " ")
          return (
            <div className="space-y-1 py-1">
              <div className="flex items-center gap-2">
                <RiskLevelBadge level={row.riskLevel} />
                <span className="font-semibold text-foreground capitalize text-xs">
                  {ruleCode.toLowerCase()}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                {row.entityType}: {row.entityId}
              </p>
            </div>
          )
        },
      },
      {
        id: "actor",
        header: "Actor",
        cell: (row) => {
          const name = row.metadata?.userName || `User ${row.userId.slice(-6)}`
          const email = row.metadata?.userEmail || `${row.userId.slice(-6)}@washqueue.com`
          const avatar = row.metadata?.userAvatar as string | undefined
          return (
            <div className="flex items-center gap-2.5 py-1">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center font-semibold text-primary shrink-0 border border-primary/30 text-xs">
                {avatar ? (
                  <img src={avatar} alt={name} className="h-full w-full object-cover" />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-xs truncate">{name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <ActorRoleBadge role={row.actorType} />
                  <span className="text-[11px] text-muted-foreground truncate">{email}</span>
                </div>
              </div>
            </div>
          )
        },
      },
      {
        id: "reason",
        header: "Detection Reason",
        cell: (row) => (
          <div className="max-w-xs space-y-1 py-1">
            <p className="text-xs text-foreground/90 font-medium line-clamp-1">{row.reason}</p>
            <div className="flex items-center gap-1 flex-wrap">
              {row.signals.slice(0, 2).map((sig, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-muted/60 text-muted-foreground border border-border/40 font-mono"
                >
                  {sig.code}
                </span>
              ))}
              {row.signals.length > 2 && (
                <span className="text-[10px] text-muted-foreground">
                  +{row.signals.length - 2} more
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        id: "score",
        header: "Score",
        align: "center",
        cell: (row) => {
          const color =
            row.riskLevel === "HIGH"
              ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
              : row.riskLevel === "MEDIUM"
                ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                : "text-blue-400 bg-blue-500/10 border-blue-500/20"
          return (
            <div className="flex flex-col items-center gap-1 py-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${color}`}>
                {row.riskScore}
              </span>
              <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    row.riskLevel === "HIGH"
                      ? "bg-rose-500"
                      : row.riskLevel === "MEDIUM"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(100, row.riskScore)}%` }}
                />
              </div>
            </div>
          )
        },
      },
      {
        id: "status",
        header: "Status",
        align: "center",
        cell: (row) => <FraudStatusBadge status={row.status} />,
      },
      {
        id: "createdAt",
        header: "Detected",
        cell: (row) => (
          <div className="text-xs text-muted-foreground py-1">
            <p className="font-medium text-foreground/90">
              {new Date(row.createdAt).toLocaleDateString()}
            </p>
            <p className="text-[11px]">
              {new Date(row.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        align: "right",
        cell: (row) => (
          <button
            onClick={() => setInvestigatingEvent(row)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground transition-all duration-150 shadow-xs cursor-pointer"
          >
            Investigate
          </button>
        ),
      },
    ],
    []
  )

  const selectFilters: SelectFilter[] = useMemo(
    () => [
      {
        id: "riskLevel",
        label: "Risk Level",
        value: riskLevelFilter,
        onChange: (val) => {
          setRiskLevelFilter(val)
          setCurrentPage(1)
        },
        options: [
          { label: "All Severities", value: "ALL" },
          { label: "High Risk", value: "HIGH" },
          { label: "Medium Risk", value: "MEDIUM" },
          { label: "Low Risk", value: "LOW" },
        ],
      },
      {
        id: "actorType",
        label: "Actor Role",
        value: actorTypeFilter,
        onChange: (val) => {
          setActorTypeFilter(val)
          setCurrentPage(1)
        },
        options: [
          { label: "All Roles", value: "ALL" },
          { label: "Customer", value: "CUSTOMER" },
          { label: "Owner", value: "OWNER" },
          { label: "Manager", value: "MANAGER" },
        ],
      },
    ],
    [riskLevelFilter, actorTypeFilter]
  )

  const filteredWatchlist = useMemo(() => {
    return watchlist.filter((user) => {
      const matchRole =
        watchlistRoleFilter === "ALL" ||
        user.role.toUpperCase() === watchlistRoleFilter.toUpperCase()
      const matchSearch =
        !watchlistSearch ||
        user.name.toLowerCase().includes(watchlistSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(watchlistSearch.toLowerCase()) ||
        user.id.toLowerCase().includes(watchlistSearch.toLowerCase())
      return matchRole && matchSearch
    })
  }, [watchlist, watchlistRoleFilter, watchlistSearch])

  const watchlistPaginationMeta: PaginationMeta = useMemo(() => {
    const total = filteredWatchlist.length
    const totalPages = Math.ceil(total / 10) || 1
    return {
      total,
      page: watchlistPage,
      limit: 10,
      totalPages,
      hasNextPage: watchlistPage < totalPages,
      hasPrevPage: watchlistPage > 1,
    }
  }, [filteredWatchlist.length, watchlistPage])

  const paginatedWatchlist = useMemo(() => {
    const start = (watchlistPage - 1) * 10
    return filteredWatchlist.slice(start, start + 10)
  }, [filteredWatchlist, watchlistPage])

  const watchlistColumns: Column<WatchlistUser>[] = useMemo(
    () => [
      {
        id: "user",
        header: "User Details",
        cell: (row) => (
          <div className="flex items-center gap-3 py-1">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center font-semibold text-primary shrink-0 border border-primary/30 text-xs">
              {row.avatar ? (
                <img src={row.avatar} alt={row.name} className="h-full w-full object-cover" />
              ) : (
                row.name.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-xs truncate">{row.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{row.email}</p>
            </div>
          </div>
        ),
      },
      {
        id: "role",
        header: "Role",
        cell: (row) => <ActorRoleBadge role={row.role} />,
      },
      {
        id: "riskScore",
        header: "Risk Score",
        align: "center",
        cell: (row) => (
          <span
            className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
              row.riskScore >= 70
                ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                : row.riskScore >= 40
                  ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                  : "text-blue-400 bg-blue-500/10 border-blue-500/20"
            }`}
          >
            {row.riskScore}
          </span>
        ),
      },
      {
        id: "cancellationRate",
        header: "Cancellation Rate",
        cell: (row) => {
          const isHigh = row.cancellationRate >= 50
          const isMed = row.cancellationRate >= 25 && row.cancellationRate < 50
          return (
            <div className="w-28 space-y-1 py-1">
              <span
                className={`text-xs font-semibold ${
                  isHigh ? "text-rose-400" : isMed ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {row.cancellationRate}%
              </span>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isHigh ? "bg-rose-500" : isMed ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, row.cancellationRate)}%` }}
                />
              </div>
            </div>
          )
        },
      },
      {
        id: "duplicateSignal",
        header: "Duplicate Signal",
        cell: (row) => (
          <span
            className={`text-xs font-semibold ${
              row.duplicateSignalStatus === "YES (HIGH)"
                ? "text-rose-400"
                : row.duplicateSignalStatus === "SUSPICIOUS"
                  ? "text-amber-400"
                  : "text-muted-foreground"
            }`}
          >
            {row.duplicateSignalStatus}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        align: "center",
        cell: (row) => (
          <div className="flex items-center justify-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                row.status === "ACTIVE"
                  ? "bg-emerald-500"
                  : row.status === "FLAGGED"
                    ? "bg-rose-500"
                    : "bg-amber-500"
              }`}
            />
            <span className="font-semibold text-[11px] tracking-wider text-muted-foreground uppercase">
              {row.status}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        align: "right",
        cell: (row) => (
          <button
            onClick={() => {
              const matchedAlert = alerts.find((a) => a.userId === row.id) || {
                id: `wl_${row.id}`,
                userId: row.id,
                actorType: (row.role.toUpperCase() as ActorType) || "CUSTOMER",
                entityType: "USER",
                entityId: row.id,
                eventType: "WATCHLIST_INVESTIGATION",
                riskScore: row.riskScore,
                riskLevel: row.riskScore >= 70 ? "HIGH" : row.riskScore >= 40 ? "MEDIUM" : "LOW",
                status: "OPEN",
                reason: `Flagged on suspicious activity watchlist with ${row.cancellationRate}% cancellation rate.`,
                signals: [
                  {
                    code: row.primarySignal || "SUSPICIOUS_WATCHLIST_FLAG",
                    description: `Cancellation rate: ${row.cancellationRate}%, duplicate heuristic: ${row.duplicateSignalStatus}`,
                    score: row.riskScore,
                  },
                ],
                metadata: {
                  userName: row.name,
                  userEmail: row.email,
                  avatar: row.avatar,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              setInvestigatingEvent(matchedAlert)
            }}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150 shadow-xs cursor-pointer"
          >
            Review
          </button>
        ),
      },
    ],
    [alerts]
  )

  const filteredLogs = useMemo(() => {
    return securityLogs.filter((log) => {
      const matchSeverity = logsSeverityFilter === "ALL" || log.severity === logsSeverityFilter
      const matchSearch =
        !logsSearch ||
        log.title.toLowerCase().includes(logsSearch.toLowerCase()) ||
        log.description.toLowerCase().includes(logsSearch.toLowerCase()) ||
        log.meta.toLowerCase().includes(logsSearch.toLowerCase())
      return matchSeverity && matchSearch
    })
  }, [securityLogs, logsSeverityFilter, logsSearch])

  const logsPaginationMeta: PaginationMeta = useMemo(() => {
    const total = filteredLogs.length
    const totalPages = Math.ceil(total / 10) || 1
    return {
      total,
      page: logsPage,
      limit: 10,
      totalPages,
      hasNextPage: logsPage < totalPages,
      hasPrevPage: logsPage > 1,
    }
  }, [filteredLogs.length, logsPage])

  const paginatedLogs = useMemo(() => {
    const start = (logsPage - 1) * 10
    return filteredLogs.slice(start, start + 10)
  }, [filteredLogs, logsPage])

  const logsColumns: Column<SecurityAuditLog>[] = useMemo(
    () => [
      {
        id: "severity",
        header: "Severity",
        align: "center",
        cell: (row) => <RiskLevelBadge level={row.severity} />,
      },
      {
        id: "title",
        header: "Event",
        cell: (row) => (
          <div className="space-y-0.5 py-1">
            <p className="font-semibold text-foreground text-xs">{row.title}</p>
            <p className="text-[11px] text-muted-foreground font-mono">{row.type}</p>
          </div>
        ),
      },
      {
        id: "description",
        header: "Description",
        cell: (row) => (
          <p className="text-xs text-foreground/90 max-w-md py-1">{row.description}</p>
        ),
      },
      {
        id: "meta",
        header: "Metadata",
        cell: (row) => (
          <span className="text-[11px] font-mono text-muted-foreground">{row.meta}</span>
        ),
      },
      {
        id: "timestamp",
        header: "Timestamp",
        align: "right",
        cell: (row) => (
          <span className="text-xs text-muted-foreground font-medium">{row.timestamp}</span>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: "Dashboard", path: APP_ROUTES.ADMIN.DASHBOARD },
              { label: "Fraud & Security" },
            ]}
          />
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Fraud & Security Monitoring
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time rule-based threat mitigation and automated pattern analysis
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-card/80 border border-border/80 rounded-lg p-1 text-xs">
            {(["Today", "7 days", "30 days"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setTimeRange(tab)
                  setCurrentPage(1)
                }}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  timeRange === tab
                    ? "bg-foreground/15 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadData()}
            title="Refresh records"
            className="p-2 rounded-lg border border-border/80 bg-card/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleExportLogs}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all duration-150 shadow-sm cursor-pointer"
          >
            <Download size={14} />
            Export Logs
          </button>
        </div>
      </div>

      <FraudStatsGrid metrics={metrics} isLoading={isLoading} />

      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveView("alerts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeView === "alerts"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card/70 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Shield size={14} />
          Fraud Incidents Queue
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeView === "alerts"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {totalAlerts}
          </span>
        </button>

        <button
          onClick={() => setActiveView("watchlist")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeView === "watchlist"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card/70 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <AlertTriangle size={14} />
          Suspicious Watchlist
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeView === "watchlist"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {watchlist.length}
          </span>
        </button>

        <button
          onClick={() => setActiveView("logs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeView === "logs"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card/70 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <ScrollText size={14} />
          Security Audit Trail
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeView === "logs"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {securityLogs.length}
          </span>
        </button>
      </div>

      {activeView === "alerts" && (
        <div className="space-y-4">
          <DataTableToolbar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q)
              setCurrentPage(1)
            }}
            searchLabel="Search Incidents"
            searchPlaceholder="Search by actor, email, reason, rule code..."
            tabs={STATUS_TABS}
            activeTab={statusFilter}
            onTabChange={(tab) => {
              setStatusFilter(tab)
              setCurrentPage(1)
            }}
            selectFilters={selectFilters}
          />

          <DataTable<FraudEventDto>
            columns={alertColumns}
            data={alerts}
            rowKey={(item) => item.id || item._id || Math.random().toString()}
            isLoading={isLoading}
            loadingText="Fetching live fraud events from server..."
            errorMsg={loadError}
            emptyMessage="No fraud events detected matching current filters."
            pagination={paginationMeta}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {activeView === "watchlist" && (
        <div className="space-y-4">
          <DataTableToolbar
            searchQuery={watchlistSearch}
            onSearchChange={(q) => {
              setWatchlistSearch(q)
              setWatchlistPage(1)
            }}
            searchLabel="Search Watchlist"
            searchPlaceholder="Search user by name, email, ID..."
            tabs={[
              { id: "ALL", label: "All Users" },
              { id: "CUSTOMER", label: "Customers" },
              { id: "OWNER", label: "Owners" },
              { id: "MANAGER", label: "Managers" },
            ]}
            activeTab={watchlistRoleFilter}
            onTabChange={(tab) => {
              setWatchlistRoleFilter(tab)
              setWatchlistPage(1)
            }}
          />

          <DataTable<WatchlistUser>
            columns={watchlistColumns}
            data={paginatedWatchlist}
            rowKey={(item) => item.id}
            isLoading={isLoading}
            loadingText="Loading watchlist from database..."
            errorMsg={loadError}
            emptyMessage="No users currently on suspicious watchlist."
            pagination={watchlistPaginationMeta}
            onPageChange={setWatchlistPage}
          />
        </div>
      )}

      {activeView === "logs" && (
        <div className="space-y-4">
          <DataTableToolbar
            searchQuery={logsSearch}
            onSearchChange={(q) => {
              setLogsSearch(q)
              setLogsPage(1)
            }}
            searchLabel="Search Logs"
            searchPlaceholder="Search audit events by action, IP, description..."
            tabs={[
              { id: "ALL", label: "All Severities" },
              { id: "HIGH", label: "High" },
              { id: "MEDIUM", label: "Medium" },
              { id: "LOW", label: "Low" },
            ]}
            activeTab={logsSeverityFilter}
            onTabChange={(tab) => {
              setLogsSeverityFilter(tab)
              setLogsPage(1)
            }}
          />

          <DataTable<SecurityAuditLog>
            columns={logsColumns}
            data={paginatedLogs}
            rowKey={(item) => item.id}
            isLoading={isLoading}
            loadingText="Loading live security logs..."
            errorMsg={loadError}
            emptyMessage="No security audit events recorded."
            pagination={logsPaginationMeta}
            onPageChange={setLogsPage}
          />
        </div>
      )}

      <InvestigateFraudModal
        event={investigatingEvent}
        isOpen={Boolean(investigatingEvent)}
        onClose={() => setInvestigatingEvent(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  )
}
