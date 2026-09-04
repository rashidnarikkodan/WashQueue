import { useEffect, useState, useMemo, useCallback } from "react"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Eye,
  TrendingUp,
  RotateCcw,
  Receipt,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import PromptModal from "@/shared/components/ui/PromptModal"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { SettlementStatusBadge } from "@/shared/components/badges"
import {
  settlementApi,
  type Settlement,
  type AdminSettlementMetrics,
} from "@/shared/apis/settlement.api"
import { SettlementDetailModal } from "@/features/owner/components/SettlementDetailModal"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import {
  DataTable,
  DataTableToolbar,
  type Column,
  type TabConfig,
  type SelectFilter,
  type PaginationMeta,
} from "@/shared/components/data-table"

const SETTLEMENT_TABS: TabConfig[] = [
  { id: "ALL", label: "All Settlements" },
  { id: "PENDING", label: "Pending", activeColor: "border-amber-500 text-amber-500" },
  { id: "HELD", label: "Held", activeColor: "border-purple-500 text-purple-500" },
  { id: "PROCESSED", label: "Processed", activeColor: "border-emerald-500 text-emerald-500" },
  { id: "FAILED", label: "Failed", activeColor: "border-rose-500 text-rose-500" },
]

const HOLDABLE_STATUSES = new Set(["PENDING", "PROCESSING", "FAILED"])

export default function AdminSettlementMonitoring() {
  const [dateFilter, setDateFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  const [metrics, setMetrics] = useState<AdminSettlementMetrics | null>(null)
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [holdTarget, setHoldTarget] = useState<Settlement | null>(null)
  const [isHolding, setIsHolding] = useState(false)
  const [releaseTarget, setReleaseTarget] = useState<Settlement | null>(null)
  const [isReleasing, setIsReleasing] = useState(false)

  const dateParams = useMemo(() => {
    if (dateFilter === "7_DAYS") {
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return { startDate: start.toISOString() }
    }
    if (dateFilter === "30_DAYS") {
      const start = new Date()
      start.setDate(start.getDate() - 30)
      return { startDate: start.toISOString() }
    }
    return {}
  }, [dateFilter])

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await settlementApi.getAdminMetrics(dateParams)
      setMetrics(data)
    } catch {
      toast.error("Failed to load platform settlement metrics")
    }
  }, [dateParams])

  const fetchSettlements = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await settlementApi.getAdminSettlements({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: searchQuery.trim() || undefined,
        page: paginationMeta.page,
        limit: 10,
        ...dateParams,
      })
      setSettlements(res.data)
      setPaginationMeta({
        total: res.pagination.total,
        page: res.pagination.page,
        limit: res.pagination.limit,
        totalPages: res.pagination.totalPages,
        hasNextPage: res.pagination.page < res.pagination.totalPages,
        hasPrevPage: res.pagination.page > 1,
      })
      setLoadError(null)
    } catch {
      const message = "Failed to load settlements"
      setLoadError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [dateParams, statusFilter, searchQuery, paginationMeta.page])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchMetrics()
    })
    return () => {
      ignore = true
    }
  }, [fetchMetrics])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchSettlements()
    })
    return () => {
      ignore = true
    }
  }, [fetchSettlements])

  const handleRefresh = () => {
    fetchMetrics()
    fetchSettlements()
  }

  const handlePageChange = (page: number) => {
    setPaginationMeta((prev) => ({ ...prev, page }))
  }

  const handleStatusTabChange = (tabId: string) => {
    setStatusFilter(tabId)
    setPaginationMeta((prev) => ({ ...prev, page: 1 }))
  }

  const handleSearchChange = (q: string) => {
    setSearchQuery(q)
    setPaginationMeta((prev) => ({ ...prev, page: 1 }))
  }

  const handleDateFilterChange = (val: string) => {
    setDateFilter(val)
    setPaginationMeta((prev) => ({ ...prev, page: 1 }))
  }

  const handleRetryPayout = async (settlementId: string) => {
    setRetryingId(settlementId)
    try {
      const updated = await settlementApi.retrySettlement(settlementId)
      toast.success("Settlement payout retry initiated")
      if (selectedSettlement?.id === settlementId) {
        setSelectedSettlement(updated)
      }
      handleRefresh()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to retry settlement payout"
      toast.error(message)
    } finally {
      setRetryingId(null)
    }
  }

  const handleHoldSettlement = async (reason: string) => {
    if (!holdTarget) return
    setIsHolding(true)
    try {
      await settlementApi.holdSettlement(holdTarget.id, reason)
      toast.success("Settlement placed on hold")
      setHoldTarget(null)
      handleRefresh()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to place settlement on hold"
      toast.error(message)
    } finally {
      setIsHolding(false)
    }
  }

  const handleReleaseSettlement = async () => {
    if (!releaseTarget) return
    setIsReleasing(true)
    try {
      await settlementApi.releaseSettlement(releaseTarget.id)
      toast.success("Settlement hold released")
      setReleaseTarget(null)
      handleRefresh()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to release settlement hold"
      toast.error(message)
    } finally {
      setIsReleasing(false)
    }
  }

  const statItems: StatItem[] = [
    {
      id: "platform-commission",
      label: "Platform Commission",
      value: `₹${(metrics?.totalPlatformCommission || 0).toFixed(2)}`,
      variant: "primary",
      icon: Receipt,
      description: "10% standard platform take",
    },
    {
      id: "gmv",
      label: "Gross Volume (GMV)",
      value: `₹${(metrics?.totalGrossVolume || 0).toFixed(2)}`,
      variant: "default",
      icon: TrendingUp,
      description: `${metrics?.totalSettlementsCount || 0} total bookings`,
    },
    {
      id: "settled",
      label: "Settled to Stations",
      value: `₹${(metrics?.totalSettledAmount || 0).toFixed(2)}`,
      variant: "emerald",
      icon: CheckCircle,
      description: `${metrics?.settledCount || 0} batches settled`,
    },
    {
      id: "pending",
      label: "Pending Transfers",
      value: `₹${(metrics?.totalPendingAmount || 0).toFixed(2)}`,
      variant: "amber",
      icon: Clock,
      description: `${metrics?.pendingCount || 0} queueing`,
    },
    {
      id: "failed",
      label: "Failed Settlements",
      value: metrics?.failedCount || 0,
      variant: "rose",
      icon: AlertTriangle,
      description: `₹${(metrics?.totalFailedAmount || 0).toFixed(2)} volume`,
    },
  ]

  const selectFilters: SelectFilter[] = [
    {
      id: "dateRange",
      label: "Date Range",
      value: dateFilter,
      onChange: handleDateFilterChange,
      options: [
        { label: "All Time", value: "ALL" },
        { label: "Last 30 Days", value: "30_DAYS" },
        { label: "Last 7 Days", value: "7_DAYS" },
      ],
    },
  ]

  const columns: Column<Settlement>[] = [
    {
      id: "createdAt",
      header: "Created Date",
      cell: (s) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(s.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "bookingNumber",
      header: "Booking #",
      cell: (s) => (
        <span className="font-mono font-semibold text-foreground whitespace-nowrap">
          {s.bookingNumber || s.bookingId.slice(0, 10)}
        </span>
      ),
    },
    {
      id: "stationName",
      header: "Station",
      cell: (s) => (
        <span className="text-foreground font-medium whitespace-nowrap">
          {s.stationName || "Station"}
        </span>
      ),
    },
    {
      id: "totalAmount",
      header: "Gross Total",
      cell: (s) => (
        <span className="font-semibold text-foreground whitespace-nowrap">
          ₹{s.totalAmount.toFixed(2)}
        </span>
      ),
    },
    {
      id: "platformCommission",
      header: "Platform Fee",
      cell: (s) => (
        <span className="font-medium text-primary whitespace-nowrap">
          ₹{s.platformCommission.toFixed(2)}
        </span>
      ),
    },
    {
      id: "stationSettlementAmount",
      header: "Net Settlement",
      cell: (s) => (
        <span className="font-bold text-emerald-500 whitespace-nowrap">
          ₹{s.stationSettlementAmount.toFixed(2)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (s) => <SettlementStatusBadge status={s.status} />,
    },
    {
      id: "payoutId",
      header: "Payout Ref",
      cell: (s) => (
        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap truncate max-w-30 block">
          {s.payoutId || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: (s) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          {s.status === "FAILED" && (
            <button
              onClick={() => handleRetryPayout(s.id)}
              disabled={retryingId === s.id}
              title="Retry payout transfer"
              className="p-1.5 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${retryingId === s.id ? "animate-spin" : ""}`} />
              Retry
            </button>
          )}
          {HOLDABLE_STATUSES.has(s.status) && (
            <button
              onClick={() => setHoldTarget(s)}
              title="Hold this settlement"
              className="p-1.5 text-xs font-bold text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Hold
            </button>
          )}
          {s.status === "HELD" && (
            <button
              onClick={() => setReleaseTarget(s)}
              title="Release hold and resume processing"
              className="p-1.5 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Release
            </button>
          )}
          <button
            onClick={() => {
              setSelectedSettlement(s)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-bold tracking-wide transition-all cursor-pointer hover:text-primary"
          >
            <Eye className="w-3.5 h-3.5" /> Details
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Breadcrumbs
        items={[
          { label: "Admin", path: APP_ROUTES.ADMIN.DASHBOARD },
          { label: "Settlement & Commission Monitoring" },
        ]}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Settlement & Financial Monitoring
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Audit platform commission revenues, provider payout transfers, and resolve held/failed
            transactions.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-muted hover:opacity-90 text-muted-foreground font-semibold px-4.5 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md select-none cursor-pointer border border-border"
          title="Refresh metrics and records"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Platform Financial KPIs via StatsHUD */}
      <StatsHUD stats={statItems} columns={5} />

      {/* Standard Management Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchLabel="Search Settlements"
        searchPlaceholder="Booking number or payout ref..."
        tabs={SETTLEMENT_TABS}
        activeTab={statusFilter}
        onTabChange={handleStatusTabChange}
        selectFilters={selectFilters}
      />

      {/* Standard DataTable */}
      <DataTable<Settlement>
        columns={columns}
        data={settlements}
        rowKey={(s) => s.id}
        isLoading={isLoading}
        loadingText="Fetching settlement ledger..."
        errorMsg={loadError}
        emptyMessage="No settlement records found matching current criteria."
        pagination={paginationMeta}
        onPageChange={handlePageChange}
      />

      {/* Statement Detail Modal */}
      <SettlementDetailModal
        settlement={selectedSettlement}
        isOpen={isModalOpen}
        isAdmin={true}
        onRetry={handleRetryPayout}
        isRetrying={Boolean(retryingId)}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedSettlement(null)
        }}
      />

      {/* Hold Settlement Modal */}
      <PromptModal
        isOpen={Boolean(holdTarget)}
        onClose={() => setHoldTarget(null)}
        onSubmit={handleHoldSettlement}
        title="Hold Settlement"
        description={`Provide a reason for holding the payout for booking ${
          holdTarget?.bookingNumber || holdTarget?.bookingId.slice(0, 10)
        }.`}
        label="Hold Reason"
        placeholder="e.g. Dispute under review"
        inputType="textarea"
        confirmText="Hold Settlement"
        variant="warning"
        isLoading={isHolding}
        required
      />

      {/* Release Hold Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(releaseTarget)}
        onClose={() => setReleaseTarget(null)}
        onConfirm={handleReleaseSettlement}
        title="Release Settlement Hold?"
        message={`This will move the settlement for booking ${
          releaseTarget?.bookingNumber || releaseTarget?.bookingId.slice(0, 10)
        } back to PENDING so it can be processed for payout again.`}
        confirmText="Release Hold"
        confirmVariant="success"
        isLoading={isReleasing}
      />
    </div>
  )
}
