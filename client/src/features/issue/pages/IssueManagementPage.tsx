import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Download, RefreshCw, Eye, LifeBuoy, Clock, AlertTriangle, CheckCircle } from "lucide-react"
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
import { IssueStatusBadge, IssuePriorityBadge, IssueCategoryBadge } from "../components"

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
        // Admin sees all platform issues
        res = await issueApi.getAdminIssues(params)
      } else if (isCustomer) {
        // Customer sees all issues made by them
        res = await issueApi.getMyIssues(params)
      } else if (isManager) {
        // Manager only sees issues of their single assigned station
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
        // Owner selects based on their station dropdown
        if (selectedStationId !== "ALL") {
          res = await issueApi.getStationIssues(selectedStationId, params)
        } else {
          // "ALL" Stations selected for Owner
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
            // Lazy load owner station if ownerStations state isn't populated yet
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

  // Top KPIs matching shared StatsHUD pattern across 5 columns
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
        id: "review",
        label: "Under Review",
        value: reviewCount,
        variant: "primary",
        icon: Eye,
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
        variant: "rose",
        icon: AlertTriangle,
        description: "Admin intervention",
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
        description: "Successfully handled",
        onClick: () => {
          setActiveTab(IssueStatus.RESOLVED)
          setCurrentPage(1)
        },
      },
    ]
  }, [totalCount, issues, isCustomer])

  // Select Filters Config for Toolbar
  const selectFilters: SelectFilter[] = useMemo(() => {
    const filters: SelectFilter[] = []

    // Station selection filter: ONLY for Owner when they own stations
    if (isOwner && ownerStations.length > 0) {
      filters.push({
        id: "stationFilter",
        label: "Filter by Station",
        value: selectedStationId,
        onChange: (val: string) => {
          setSelectedStationId(val)
          setCurrentPage(1)
        },
        options: [
          { label: "All Stations", value: "ALL" },
          ...ownerStations.map((st) => ({ label: st.name, value: st.id })),
        ],
      })
    }

    filters.push({
      id: "priority",
      label: "Priority",
      value: priorityFilter,
      onChange: (v) => {
        setPriorityFilter(v)
        setCurrentPage(1)
      },
      options: [
        { value: "ALL", label: "All Priority" },
        { value: IssuePriority.CRITICAL, label: "Critical" },
        { value: IssuePriority.HIGH, label: "High" },
        { value: IssuePriority.MEDIUM, label: "Medium" },
        { value: IssuePriority.LOW, label: "Low" },
      ],
    })

    filters.push({
      id: "category",
      label: "Category",
      value: categoryFilter,
      onChange: (v) => {
        setCategoryFilter(v)
        setCurrentPage(1)
      },
      options: [
        { value: "ALL", label: "All Categories" },
        ...Object.values(IssueCategory).map((c) => ({
          value: c,
          label: c,
        })),
      ],
    })

    return filters
  }, [categoryFilter, isOwner, ownerStations, priorityFilter, selectedStationId])

  // Columns for DataTable based on active role
  const columns: Column<IssueDto>[] = useMemo(() => {
    if (isCustomer) {
      return [
        {
          id: "id",
          header: "Ticket ID",
          cell: (issue) => (
            <span
              onClick={() => navigate(getIssueDetailPath(issue.id))}
              className="font-mono font-bold text-primary hover:underline cursor-pointer"
            >
              #{issue.id}
            </span>
          ),
        },
        {
          id: "station_booking",
          header: "Station & Booking",
          cell: (issue) => {
            const stationName = issue.stationDetails?.name || "WashQueue Station"
            const bookingNumber = issue.bookingDetails?.bookingNumber || issue.bookingId || "N/A"
            return (
              <div className="space-y-0.5 text-left">
                <span className="font-bold text-foreground block truncate max-w-[220px]">
                  {stationName}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground block">
                  {bookingNumber}
                </span>
              </div>
            )
          },
        },
        {
          id: "vehicle",
          header: "Vehicle",
          cell: (issue) => {
            const plate = issue.bookingDetails?.vehiclePlate || "N/A"
            return (
              <span className="px-2 py-0.5 rounded bg-muted/80 text-[11px] font-mono font-bold text-foreground border border-border">
                {plate}
              </span>
            )
          },
        },
        {
          id: "category",
          header: "Category",
          cell: (issue) => <IssueCategoryBadge category={issue.category || "General Concern"} />,
        },
        {
          id: "priority",
          header: "Priority",
          cell: (issue) => <IssuePriorityBadge priority={issue.priority} />,
        },
        {
          id: "status",
          header: "Status",
          cell: (issue) => <IssueStatusBadge status={issue.status} />,
        },
        {
          id: "created",
          header: "Reported",
          cell: (issue) => (
            <span className="text-xs text-muted-foreground font-mono">
              {formatTimeAgo(issue.createdAt)}
            </span>
          ),
        },
        {
          id: "action",
          header: "Action",
          cell: (issue) => (
            <button
              type="button"
              onClick={() => navigate(getIssueDetailPath(issue.id))}
              className="px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 bg-card hover:bg-muted text-foreground text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>Details</span>
            </button>
          ),
        },
      ]
    }

    // Owner / Manager / Admin Columns
    return [
      {
        id: "id",
        header: "Issue ID",
        cell: (issue) => (
          <span
            onClick={() => navigate(getIssueDetailPath(issue.id))}
            className="font-mono font-bold text-primary hover:underline cursor-pointer"
          >
            #{issue.id}
          </span>
        ),
      },
      {
        id: "customer_booking",
        header: "Customer / Booking",
        cell: (issue) => {
          const customerName = issue.customerDetails?.name || "Customer"
          const bookingNumber = issue.bookingDetails?.bookingNumber || issue.bookingId || "N/A"
          return (
            <div className="space-y-0.5 text-left">
              <span className="font-bold text-foreground block truncate max-w-[200px]">
                {customerName}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground block">
                {bookingNumber}
              </span>
            </div>
          )
        },
      },
      {
        id: "vehicle",
        header: "Vehicle",
        cell: (issue) => {
          const plate = issue.bookingDetails?.vehiclePlate || "N/A"
          return (
            <span className="px-2 py-0.5 rounded bg-muted/80 text-[11px] font-mono font-bold text-foreground border border-border">
              {plate}
            </span>
          )
        },
      },
      {
        id: "category",
        header: "Category",
        cell: (issue) => <IssueCategoryBadge category={issue.category || "Hardware Failure"} />,
      },
      {
        id: "priority",
        header: "Priority",
        cell: (issue) => <IssuePriorityBadge priority={issue.priority} />,
      },
      {
        id: "status",
        header: "Status",
        cell: (issue) => <IssueStatusBadge status={issue.status} />,
      },
      {
        id: "created",
        header: "Created",
        cell: (issue) => (
          <span className="text-xs text-muted-foreground font-mono">
            {formatTimeAgo(issue.createdAt)}
          </span>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: (issue) => (
          <button
            type="button"
            onClick={() => navigate(getIssueDetailPath(issue.id))}
            className="px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 bg-card hover:bg-muted text-foreground text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span>Investigate</span>
          </button>
        ),
      },
    ]
  }, [formatTimeAgo, getIssueDetailPath, isCustomer, navigate])

  const paginationMeta: PaginationMeta = useMemo(
    () => ({
      total: totalCount,
      page: currentPage,
      limit: 10,
      totalPages: totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    }),
    [currentPage, totalCount, totalPages]
  )

  const handleExportReport = () => {
    toast.success("Exporting issues CSV report...")
    const headers = "Issue ID,Customer,Booking,Vehicle,Category,Priority,Status,Created\n"
    const rows = issues
      .map(
        (i) =>
          `"${i.id}","${i.customerDetails?.name || ""}","${i.bookingDetails?.bookingNumber || i.bookingId}","${i.bookingDetails?.vehiclePlate || ""}","${i.category || ""}","${i.priority || ""}","${i.status}","${i.createdAt}"`
      )
      .join("\n")

    const blob = new Blob([headers + rows], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Issues-Report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const breadcrumbsPath = isAdmin
    ? "/admin/dashboard"
    : isOwner
      ? "/owner/dashboard"
      : isManager
        ? "/manager/queue"
        : "/"

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300 min-h-screen pb-20">
      <Breadcrumbs
        items={[
          {
            label: isAdmin ? "Admin" : isOwner ? "Owner" : isManager ? "Manager" : "Home",
            path: breadcrumbsPath,
          },
          { label: isCustomer ? "Support & Tickets" : "Issue Management" },
        ]}
      />

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {isCustomer ? "Support & Tickets" : "Issue Management"}
            </h1>
            {isCustomer && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                Customer Care
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isCustomer
              ? "View, track, and manage all your reported tickets and resolution outcomes."
              : isManager
                ? "Investigate and resolve customer issues for your assigned station."
                : "Audit customer complaints, investigate service incidents, and manage station issue resolutions."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isCustomer && (
            <button
              type="button"
              onClick={handleExportReport}
              className="flex items-center gap-2 bg-muted hover:opacity-90 text-muted-foreground font-semibold px-4.5 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md select-none cursor-pointer border border-border"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fetchIssues()}
            className="flex items-center gap-2 bg-muted hover:opacity-90 text-muted-foreground font-semibold px-4.5 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md select-none cursor-pointer border border-border"
            title="Refresh issues"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top KPIs via shared StatsHUD (5 columns) */}
      <StatsHUD stats={statItems} columns={5} />

      {/* Full width DataTableToolbar */}
      <DataTableToolbar
        tabs={ISSUE_TABS}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          setCurrentPage(1)
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q)
          setCurrentPage(1)
        }}
        searchLabel="Search Issues"
        searchPlaceholder={
          isCustomer
            ? "Search by Ticket ID, booking reference..."
            : "Search ID, customer, booking..."
        }
        selectFilters={selectFilters}
      />

      {/* Full width DataTable */}
      <DataTable<IssueDto>
        columns={columns}
        data={issues}
        rowKey={(issue) => issue.id}
        isLoading={isLoading}
        loadingText="Fetching issue records..."
        errorMsg={error}
        emptyMessage={
          isCustomer
            ? "You haven't reported any support tickets yet."
            : "No matching issue records found."
        }
        pagination={paginationMeta}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  )
}
