import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Download,
  RefreshCw,
  Eye,
  LifeBuoy,
  Clock,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  ShieldAlert,
} from "lucide-react"
import { toast } from "sonner"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import {
  DataTable,
  DataTableToolbar,
  type Column,
  type TabConfig,
  type SelectFilter,
  type PaginationMeta,
} from "@/shared/components/data-table"
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import { ROLE, type RoleType } from "@/shared/constants/role.const"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"
import { issueApi } from "@/shared/apis/issue.api"
import { stationApi } from "@/shared/apis/station.api"
import { managerApi } from "@/shared/apis/manager.api"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { getErrorMessage } from "@/shared/utils/error"
import type { IssueDto, IssueQueryParams } from "../types/issue.types"
import { IssueStatus, IssuePriority, IssueCategory } from "../types/issue.types"
import {
  IssueStatusBadge,
  IssuePriorityBadge,
  IssueCategoryBadge,
  CreateIssueModal,
} from "../components"

const ISSUE_TABS: TabConfig[] = [
  { id: "ALL", label: "All Issues" },
  { id: IssueStatus.OPEN, label: "Open", activeColor: "border-blue-500 text-blue-500" },
  {
    id: IssueStatus.UNDER_REVIEW,
    label: "Under Review",
    activeColor: "border-amber-500 text-amber-500",
  },
  {
    id: IssueStatus.ESCALATED,
    label: "Escalated",
    activeColor: "border-purple-500 text-purple-500",
  },
  {
    id: IssueStatus.RESOLVED,
    label: "Resolved",
    activeColor: "border-emerald-500 text-emerald-500",
  },
  {
    id: IssueStatus.CLOSED,
    label: "Closed",
    activeColor: "border-slate-400 text-slate-400",
  },
]

interface IssueManagementPageProps {
  role?: RoleType | string
}

export default function IssueManagementPage({ role: explicitRole }: IssueManagementPageProps = {}) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  const currentRole: RoleType = useMemo(() => {
    if (explicitRole) return explicitRole as RoleType
    if (user?.role === ROLE.ADMIN || location.pathname.startsWith("/admin")) return ROLE.ADMIN
    if (user?.role === ROLE.OWNER || location.pathname.startsWith("/owner")) return ROLE.OWNER
    if (user?.role === ROLE.MANAGER || location.pathname.startsWith("/manager")) return ROLE.MANAGER
    return ROLE.CUSTOMER
  }, [explicitRole, user?.role, location.pathname])

  const isAdmin = currentRole === ROLE.ADMIN
  const isManager = currentRole === ROLE.MANAGER
  const isOwner = currentRole === ROLE.OWNER
  const isCustomer = currentRole === ROLE.CUSTOMER

  // Owner Stations state
  const [ownerStations, setOwnerStations] = useState<{ id: string; name: string }[]>([])
  const [selectedStationId, setSelectedStationId] = useState<string>("ALL")

  // Filters & Tabs state
  const [activeTab, setActiveTab] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")

  // Data & Pagination state
  const [issues, setIssues] = useState<IssueDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [nowMs] = useState(() => Date.now())

  // Customer create modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Load Owner stations for station dropdown
  useEffect(() => {
    if (!isOwner) return
    const ownerUserId = user?.ownerId || user?.id
    if (!ownerUserId) return

    let cancelled = false
    stationApi
      .getStations({
        limit: 100,
        status: "all",
        ownerId: ownerUserId,
      })
      .then((res) => {
        if (cancelled) return
        if (res && Array.isArray(res.stations)) {
          setOwnerStations(res.stations.map((s) => ({ id: s.id, name: s.name })))
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [isOwner, user])

  // Format Helpers
  const formatTimeAgo = useCallback(
    (dateStr: string) => {
      try {
        const d = new Date(dateStr)
        const diffMins = Math.floor((nowMs - d.getTime()) / 60000)
        if (diffMins < 60) return `${diffMins}m ago`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`
        return d.toLocaleDateString()
      } catch {
        return "recently"
      }
    },
    [nowMs]
  )

  const getIssueDetailPath = useCallback(
    (issueId: string) => {
      if (isAdmin) return `${APP_ROUTES.ADMIN.ROOT}/issues/${issueId}`
      if (isOwner) return `${APP_ROUTES.OWNER.ROOT}/issues/${issueId}`
      if (isManager) return `${APP_ROUTES.MANAGER.ROOT}/issues/${issueId}`
      return `/issues/${issueId}`
    },
    [isAdmin, isManager, isOwner]
  )

  // Fetch real API data per active role
  const fetchIssues = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: IssueQueryParams = {
        page: currentPage,
        limit: 10,
        status: activeTab === "ALL" ? undefined : (activeTab as IssueStatus),
        priority: priorityFilter === "ALL" ? undefined : (priorityFilter as IssuePriority),
        category: categoryFilter === "ALL" ? undefined : categoryFilter,
        search: searchQuery.trim() || undefined,
      }

      let res
      if (isAdmin) {
        res = await issueApi.getAdminIssues(params)
      } else if (isCustomer) {
        res = await issueApi.getMyIssues(params)
      } else if (isManager) {
        try {
          const managedList = await managerApi.getManagedStation()
          if (managedList && managedList.length > 0) {
            res = await issueApi.getStationIssues(managedList[0].stationId, params)
          } else {
            res = { issues: [], total: 0, page: 1, limit: 10, totalPages: 1 }
          }
        } catch {
          res = { issues: [], total: 0, page: 1, limit: 10, totalPages: 1 }
        }
      } else if (isOwner) {
        if (selectedStationId !== "ALL") {
          res = await issueApi.getStationIssues(selectedStationId, params)
        } else {
          if (ownerStations.length === 1) {
            res = await issueApi.getStationIssues(ownerStations[0].id, params)
          } else if (ownerStations.length > 1) {
            const allPromises = ownerStations.map((st) =>
              issueApi
                .getStationIssues(st.id, { ...params, limit: 50 })
                .catch(() => ({ issues: [], total: 0, page: 1, limit: 50, totalPages: 1 }))
            )
            const results = await Promise.all(allPromises)
            const allIssues = results.flatMap((r) => r.issues || [])
            const uniqueIssues = Array.from(
              new Map(allIssues.map((item) => [item.id, item])).values()
            ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            const pageStart = (currentPage - 1) * 10
            const paginated = uniqueIssues.slice(pageStart, pageStart + 10)
            res = {
              issues: paginated,
              total: uniqueIssues.length,
              page: currentPage,
              limit: 10,
              totalPages: Math.ceil(uniqueIssues.length / 10) || 1,
            }
          } else {
            const ownerUserId = user?.ownerId || user?.id
            if (ownerUserId) {
              const stRes = await stationApi.getStations({ ownerId: ownerUserId, limit: 100 })
              const stList = stRes?.stations || []
              if (stList.length > 0) {
                res = await issueApi.getStationIssues(stList[0].id, params)
              } else {
                res = { issues: [], total: 0, page: 1, limit: 10, totalPages: 1 }
              }
            } else {
              res = { issues: [], total: 0, page: 1, limit: 10, totalPages: 1 }
            }
          }
        }
      } else {
        res = await issueApi.getMyIssues(params)
      }

      if (res && Array.isArray(res.issues)) {
        setIssues(res.issues)
        setTotalCount(res.total ?? res.issues.length)
        setTotalPages(res.totalPages || 1)
      } else {
        setIssues([])
        setTotalCount(0)
        setTotalPages(1)
      }
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to load issues from server")
      setError(msg)
      setIssues([])
      setTotalCount(0)
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }, [
    activeTab,
    categoryFilter,
    currentPage,
    isAdmin,
    isCustomer,
    isManager,
    isOwner,
    ownerStations,
    priorityFilter,
    searchQuery,
    selectedStationId,
    user,
  ])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchIssues()
    })
    return () => {
      ignore = true
    }
  }, [fetchIssues])

  // Top KPIs matching shared StatsHUD pattern
  const statItems: StatItem[] = useMemo(() => {
    const total = totalCount || issues.length
    const openCount = issues.filter((i) => i.status === IssueStatus.OPEN).length
    const reviewCount = issues.filter((i) => i.status === IssueStatus.UNDER_REVIEW).length
    const escalatedCount = issues.filter((i) => i.status === IssueStatus.ESCALATED).length
    const resolvedCount = issues.filter(
      (i) => i.status === IssueStatus.RESOLVED || i.status === IssueStatus.CLOSED
    ).length

    return [
      {
        id: "total",
        label: isCustomer ? "Total Tickets" : "Total Issues",
        value: total,
        variant: "blue",
        icon: LifeBuoy,
        description: isCustomer ? "All reported inquiries" : "Station logged cases",
        onClick: () => {
          setActiveTab("ALL")
          setCurrentPage(1)
        },
      },
      {
        id: "open",
        label: "Open Cases",
        value: openCount,
        variant: "amber",
        icon: Clock,
        description: "Awaiting initial review",
        onClick: () => {
          setActiveTab(IssueStatus.OPEN)
          setCurrentPage(1)
        },
      },
      {
        id: "under-review",
        label: "Under Review",
        value: reviewCount,
        variant: "blue",
        icon: ShieldAlert,
        description: "Active investigation",
        onClick: () => {
          setActiveTab(IssueStatus.UNDER_REVIEW)
          setCurrentPage(1)
        },
      },
      {
        id: "escalated",
        label: "Escalated",
        value: escalatedCount,
        variant: "red",
        icon: AlertTriangle,
        description: "Admin intervention needed",
        onClick: () => {
          setActiveTab(IssueStatus.ESCALATED)
          setCurrentPage(1)
        },
      },
      {
        id: "resolved",
        label: "Resolved Cases",
        value: resolvedCount,
        variant: "emerald",
        icon: CheckCircle,
        description: "Settled & concluded",
        onClick: () => {
          setActiveTab(IssueStatus.RESOLVED)
          setCurrentPage(1)
        },
      },
    ]
  }, [totalCount, issues, isCustomer])

  // Select Filters
  const selectFilters: SelectFilter[] = useMemo(() => {
    const filters: SelectFilter[] = [
      {
        id: "priority",
        label: "Priority",
        value: priorityFilter,
        options: [
          { value: "ALL", label: "All Priorities" },
          { value: IssuePriority.CRITICAL, label: "Critical" },
          { value: IssuePriority.HIGH, label: "High" },
          { value: IssuePriority.MEDIUM, label: "Medium" },
          { value: IssuePriority.LOW, label: "Low" },
        ],
        onChange: (val) => {
          setPriorityFilter(val)
          setCurrentPage(1)
        },
      },
      {
        id: "category",
        label: "Category",
        value: categoryFilter,
        options: [
          { value: "ALL", label: "All Categories" },
          ...Object.values(IssueCategory).map((cat) => ({ value: cat, label: cat })),
        ],
        onChange: (val) => {
          setCategoryFilter(val)
          setCurrentPage(1)
        },
      },
    ]

    if (isOwner && ownerStations.length > 1) {
      filters.unshift({
        id: "station",
        label: "Station",
        value: selectedStationId,
        options: [
          { value: "ALL", label: "All Stations" },
          ...ownerStations.map((st) => ({ value: st.id, label: st.name })),
        ],
        onChange: (val) => {
          setSelectedStationId(val)
          setCurrentPage(1)
        },
      })
    }

    return filters
  }, [categoryFilter, isOwner, ownerStations, priorityFilter, selectedStationId])

  // DataTable Columns
  const columns: Column<IssueDto>[] = useMemo(
    () => [
      {
        id: "id",
        header: "CASE ID & BOOKING",
        cell: (issue) => (
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-foreground">#{issue.id}</span>
              {issue.customerEvidence && issue.customerEvidence.length > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-bold">
                  {issue.customerEvidence.length} photo
                  {issue.customerEvidence.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              BK: {issue.bookingDetails?.bookingNumber || issue.bookingId}
            </div>
          </div>
        ),
      },
      {
        id: "details",
        header: "ISSUE DETAILS",
        cell: (issue) => (
          <div className="space-y-1.5 max-w-sm text-left">
            <div className="flex items-center gap-2">
              <IssueCategoryBadge category={issue.category} />
            </div>
            <p className="text-xs text-foreground font-medium line-clamp-2 leading-relaxed">
              {issue.customerDescription}
            </p>
            {issue.stationDetails?.name && (
              <span className="text-[11px] text-muted-foreground block truncate">
                📍 {issue.stationDetails.name}
              </span>
            )}
          </div>
        ),
      },
      {
        id: "customer",
        header: isCustomer ? "SERVICE DETAILS" : "CUSTOMER",
        cell: (issue) => {
          if (isCustomer) {
            return (
              <div className="space-y-1 text-left">
                <span className="text-xs font-bold text-foreground block">
                  {issue.stationDetails?.name || "Service Station"}
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  {issue.bookingDetails?.vehicleModel ||
                    issue.bookingDetails?.vehiclePlate ||
                    issue.bookingDetails?.serviceType ||
                    "Vehicle Wash"}
                </span>
              </div>
            )
          }

          return (
            <div className="space-y-1 text-left">
              <span className="text-xs font-bold text-foreground block">
                {issue.customerDetails?.name || "Customer"}
              </span>
              <span className="text-[11px] text-muted-foreground block truncate">
                {issue.customerDetails?.email || issue.customerDetails?.phone || "No direct phone"}
              </span>
            </div>
          )
        },
      },
      {
        id: "priority",
        header: "PRIORITY",
        cell: (issue) => <IssuePriorityBadge priority={issue.priority} />,
      },
      {
        id: "status",
        header: "STATUS",
        cell: (issue) => <IssueStatusBadge status={issue.status} />,
      },
      {
        id: "createdAt",
        header: "REPORTED",
        cell: (issue) => (
          <div className="text-left space-y-0.5">
            <span className="text-xs font-medium text-foreground block">
              {formatTimeAgo(issue.createdAt)}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono block">
              {new Date(issue.createdAt).toLocaleDateString()}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "ACTIONS",
        cell: (issue) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(getIssueDetailPath(issue.id))}
              className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Eye size={13} />
              <span>Investigate</span>
            </button>
          </div>
        ),
      },
    ],
    [formatTimeAgo, getIssueDetailPath, isCustomer, navigate]
  )

  const paginationMeta: PaginationMeta = useMemo(
    () => ({
      total: totalCount,
      page: currentPage,
      limit: 10,
      totalPages: Math.max(1, totalPages),
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    }),
    [currentPage, totalCount, totalPages]
  )

  const handleExportData = () => {
    try {
      const csvHeader = "ID,BookingId,Status,Priority,Category,Description,CreatedDate\n"
      const csvRows = issues
        .map(
          (i) =>
            `"${i.id}","${i.bookingId}","${i.status}","${i.priority || "MEDIUM"}","${
              i.category || "Vehicle Damage"
            }","${i.customerDescription.replace(/"/g, '""')}","${i.createdAt}"`
        )
        .join("\n")
      const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `washqueue-issues-export-${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Issue logs exported to CSV.")
    } catch {
      toast.error("Failed to export issue data.")
    }
  }

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300 pb-20">
      {/* Top Header & Breadcrumbs */}
      <div className="space-y-3 pb-2 border-b border-border/60">
        <Breadcrumbs
          items={[
            { label: isCustomer ? "My Account" : "Management" },
            { label: isCustomer ? "Support & Tickets" : "Issue Management" },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <LifeBuoy className="w-8 h-8 text-primary" />
              <span>{isCustomer ? "Support Tickets & Issues" : "Issue Management Hub"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isCustomer
                ? "Track and manage reported concerns for your station wash bookings."
                : "Investigate customer complaints, inspect optical verification scans, and issue official resolutions."}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isCustomer && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Raise Ticket</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fetchIssues()}
              disabled={isLoading}
              className="p-2.5 rounded-2xl border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-primary" : ""} />
            </button>

            {!isCustomer && (
              <button
                type="button"
                onClick={handleExportData}
                disabled={issues.length === 0}
                className="px-4 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Download size={14} className="text-primary" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats HUD */}
      <StatsHUD stats={statItems} columns={5} />

      {/* Main DataTable Card */}
      <div className="rounded-3xl bg-card border border-border shadow-xl overflow-hidden p-6 space-y-6">
        <DataTableToolbar
          tabs={ISSUE_TABS}
          activeTab={activeTab}
          onTabChange={(tabId) => {
            setActiveTab(tabId)
            setCurrentPage(1)
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q)
            setCurrentPage(1)
          }}
          searchPlaceholder="Search by keyword, case ID, customer or details..."
          selectFilters={selectFilters}
        />

        {error ? (
          <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <h3 className="text-sm font-bold text-foreground">Error Loading Cases</h3>
            <p className="text-xs text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => fetchIssues()}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <DataTable<IssueDto>
            data={issues}
            columns={columns}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            emptyMessage={
              isCustomer
                ? "You haven't logged any support tickets. If you experienced any issue with a wash, click 'Raise Ticket'."
                : "No issue cases match the current filter selection."
            }
            pagination={paginationMeta}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {isCreateModalOpen && (
        <CreateIssueModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            fetchIssues()
          }}
        />
      )}
    </div>
  )
}
