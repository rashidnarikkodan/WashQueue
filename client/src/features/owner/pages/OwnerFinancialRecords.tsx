import { useEffect, useState, useMemo, useCallback } from "react"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  RefreshCw,
  Eye,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Receipt,
} from "lucide-react"
import { toast } from "sonner"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import { SettlementStatusBadge } from "@/shared/components/badges"
import {
  settlementApi,
  type Settlement,
  type OwnerEarningsSummary,
  type EarningsItem,
} from "@/shared/apis/settlement.api"
import { SettlementDetailModal } from "../components/SettlementDetailModal"
import { useNavigate } from "react-router-dom"
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

type TabType = "SETTLEMENTS" | "EARNINGS"

const MAIN_TABS: TabConfig[] = [
  { id: "SETTLEMENTS", label: "Settlement Payouts" },
  { id: "EARNINGS", label: "Washes & Revenue Breakdown" },
]

export default function OwnerFinancialRecords() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>("SETTLEMENTS")
  const [dateFilter, setDateFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  const [summary, setSummary] = useState<OwnerEarningsSummary | null>(null)
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [earnings, setEarnings] = useState<EarningsItem[]>([])
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
  const [loadError, setLoadError] = useState<string | null>(null)

  // Calculate start/end dates from filter
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

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      const data = await settlementApi.getOwnerSummary(dateParams)
      setSummary(data)
    } catch {
      toast.error("Failed to load earnings summary")
    }
  }, [dateParams])

  // Fetch settlements or earnings depending on active tab
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      if (activeTab === "SETTLEMENTS") {
        const res = await settlementApi.getOwnerSettlements({
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
      } else {
        const res = await settlementApi.getOwnerEarnings({
          page: paginationMeta.page,
          limit: 10,
          search: searchQuery.trim() || undefined,
        })
        setEarnings(res.data)
        setPaginationMeta({
          total: res.pagination.total,
          page: res.pagination.page,
          limit: res.pagination.limit,
          totalPages: res.pagination.totalPages,
          hasNextPage: res.pagination.page < res.pagination.totalPages,
          hasPrevPage: res.pagination.page > 1,
        })
      }
      setLoadError(null)
    } catch {
      const message = "Failed to load financial records"
      setLoadError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, dateParams, statusFilter, searchQuery, paginationMeta.page])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchSummary()
    })
    return () => {
      ignore = true
    }
  }, [fetchSummary])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchData()
    })
    return () => {
      ignore = true
    }
  }, [fetchData])

  const handleRefresh = () => {
    fetchSummary()
    fetchData()
  }

  const handlePageChange = (page: number) => {
    setPaginationMeta((prev) => ({ ...prev, page }))
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as TabType)
    setPaginationMeta((prev) => ({ ...prev, page: 1 }))
  }

  const handleSearchChange = (q: string) => {
    setSearchQuery(q)
    setPaginationMeta((prev) => ({ ...prev, page: 1 }))
  }

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val)
    setPaginationMeta((prev) => ({ ...prev, page: 1 }))
  }

  const handleDateFilterChange = (val: string) => {
    setDateFilter(val)
    setPaginationMeta((prev) => ({ ...prev, page: 1 }))
  }

  const statItems: StatItem[] = [
    {
      id: "net-earnings",
      label: "Net Earnings",
      value: `₹${(summary?.totalNetEarnings || 0).toFixed(2)}`,
      variant: "emerald",
      icon: TrendingUp,
      description: `From ₹${(summary?.totalGrossRevenue || 0).toFixed(2)} gross`,
    },
    {
      id: "paid-out",
      label: "Paid Out",
      value: `₹${(summary?.settledAmount || 0).toFixed(2)}`,
      variant: "blue",
      icon: CheckCircle,
      description: "Directly deposited",
    },
    {
      id: "pending",
      label: "Pending Transfers",
      value: `₹${(summary?.pendingAmount || 0).toFixed(2)}`,
      variant: "amber",
      icon: Clock,
      description: "Queued for transfer",
    },
    {
      id: "failed",
      label: "Failed Payouts",
      value: `₹${(summary?.failedAmount || 0).toFixed(2)}`,
      variant: "rose",
      icon: AlertCircle,
      description: "Requires attention",
    },
    {
      id: "platform-fee",
      label: "Platform Fee (10%)",
      value: `₹${(summary?.totalPlatformCommission || 0).toFixed(2)}`,
      variant: "default",
      icon: Receipt,
      description: `${summary?.completedBookingsCount || 0} washes completed`,
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
    ...(activeTab === "SETTLEMENTS"
      ? [
          {
            id: "status",
            label: "Status",
            value: statusFilter,
            onChange: handleStatusFilterChange,
            options: [
              { label: "All Statuses", value: "ALL" },
              { label: "Pending", value: "PENDING" },
              { label: "Held", value: "HELD" },
              { label: "Processed", value: "PROCESSED" },
              { label: "Failed", value: "FAILED" },
              { label: "Reversed", value: "REVERSED" },
            ],
          },
        ]
      : []),
  ]

  const settlementColumns: Column<Settlement>[] = [
    {
      id: "createdAt",
      header: "Date",
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
        <span className="font-medium text-destructive whitespace-nowrap">
          - ₹{s.platformCommission.toFixed(2)}
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
        <button
          onClick={() => {
            setSelectedSettlement(s)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-bold tracking-wide transition-all cursor-pointer hover:text-primary whitespace-nowrap"
        >
          <Eye className="w-3.5 h-3.5" /> Details
        </button>
      ),
    },
  ]

  const earningsColumns: Column<EarningsItem>[] = [
    {
      id: "completedAt",
      header: "Completed At",
      cell: (e) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(e.completedAt).toLocaleString()}
        </span>
      ),
    },
    {
      id: "bookingNumber",
      header: "Booking #",
      cell: (e) => (
        <span className="font-mono font-semibold text-foreground whitespace-nowrap">
          {e.bookingNumber}
        </span>
      ),
    },
    {
      id: "stationName",
      header: "Station",
      cell: (e) => (
        <span className="text-foreground font-medium whitespace-nowrap">{e.stationName}</span>
      ),
    },
    {
      id: "customerVehicle",
      header: "Customer / Vehicle",
      cell: (e) => (
        <div className="text-xs whitespace-nowrap">
          <span className="font-medium text-foreground block">{e.customerName}</span>
          <span className="text-muted-foreground font-mono">{e.vehicleRegNumber}</span>
        </div>
      ),
    },
    {
      id: "grossAmount",
      header: "Gross Total",
      cell: (e) => (
        <span className="font-semibold text-foreground whitespace-nowrap">
          ₹{e.grossAmount.toFixed(2)}
        </span>
      ),
    },
    {
      id: "platformCommission",
      header: "Commission",
      cell: (e) => (
        <span className="font-medium text-destructive whitespace-nowrap">
          - ₹{e.platformCommission.toFixed(2)}
        </span>
      ),
    },
    {
      id: "netEarnings",
      header: "Net Earned",
      cell: (e) => (
        <span className="font-bold text-emerald-500 whitespace-nowrap">
          ₹{e.netEarnings.toFixed(2)}
        </span>
      ),
    },
    {
      id: "paymentMethod",
      header: "Payment Method",
      cell: (e) => (
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          {e.paymentMethod}
        </span>
      ),
    },
    {
      id: "settlementStatus",
      header: "Payout Status",
      cell: (e) => <SettlementStatusBadge status={e.settlementStatus} />,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", path: APP_ROUTES.OWNER.DASHBOARD },
          { label: "Financial Records & Settlements" },
        ]}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Provider Financial Records & Payouts
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor gross booking revenues, platform commission deductions, and bank settlements.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-muted hover:opacity-90 text-muted-foreground font-semibold px-4.5 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md select-none cursor-pointer border border-border"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Payout Account Status Banner */}
      {summary && (
        <>
          {summary.payoutAccountStatus.hasLinkedAccount ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-500 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Payout Transfer Account Connected
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {summary.payoutAccountStatus.bankName || "Bank Account"}:{" "}
                    <span className="font-mono text-foreground font-medium">
                      {summary.payoutAccountStatus.accountNumberMasked || "Active"}
                    </span>
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-full">
                Active & Verified
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-500 rounded-xl shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Payout Account Setup Required
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your station payouts are currently held safely until your payout account is
                    linked. Please finish onboarding verification to enable automated bank
                    transfers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(APP_ROUTES.OWNER.ONBOARDING)}
                className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Complete Onboarding <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Stats HUD Cards */}
      <StatsHUD stats={statItems} columns={5} />

      {/* Management Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchLabel={activeTab === "SETTLEMENTS" ? "Search Settlements" : "Search Earnings"}
        searchPlaceholder={
          activeTab === "SETTLEMENTS"
            ? "Search booking # or payout ref..."
            : "Search booking # or vehicle..."
        }
        tabs={MAIN_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectFilters={selectFilters}
      />

      {/* Tab 1: Settlements Table */}
      {activeTab === "SETTLEMENTS" && (
        <DataTable<Settlement>
          columns={settlementColumns}
          data={settlements}
          rowKey={(s) => s.id}
          isLoading={isLoading}
          loadingText="Loading settlement records..."
          errorMsg={loadError}
          emptyMessage="No settlement records found matching current criteria."
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}

      {/* Tab 2: Washes Breakdown Table */}
      {activeTab === "EARNINGS" && (
        <DataTable<EarningsItem>
          columns={earningsColumns}
          data={earnings}
          rowKey={(e) => e.bookingId}
          isLoading={isLoading}
          loadingText="Loading wash earnings..."
          errorMsg={loadError}
          emptyMessage="No completed bookings found."
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}

      {/* Statement Detail Modal */}
      <SettlementDetailModal
        settlement={selectedSettlement}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedSettlement(null)
        }}
      />
    </div>
  )
}
