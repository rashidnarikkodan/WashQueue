import { useEffect, useCallback, useMemo } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import {
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Layers,
  Star,
} from "lucide-react"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import StationCard from "@/shared/components/cards/StationCard"
import { DataTable, type Column, type TabConfig } from "@/shared/components/data-table"
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import { useStationStore } from "../store/station.store"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { STATION_STATUS, type Station } from "../types"

// Tab definitions for filtering stations
const ADMIN_TABS: TabConfig[] = [
  { id: "all", label: "All Stations" },
  { id: "pending", label: "Pending Review", activeColor: "border-amber-500 text-amber-500" },
  { id: "active", label: "Active Stations", activeColor: "border-emerald-500 text-emerald-500" },
  { id: "suspended", label: "Suspended", activeColor: "border-amber-500 text-amber-500" },
  { id: "rejected", label: "Rejected", activeColor: "border-red-500 text-red-500" },
]

const OWNER_TABS: TabConfig[] = [
  { id: "all", label: "All Stations" },
  { id: "active", label: "Active", activeColor: "border-emerald-500 text-emerald-500" },
  { id: "inactive", label: "Inactive", activeColor: "border-slate-400 text-slate-400" },
  { id: "suspended", label: "Suspended", activeColor: "border-amber-500 text-amber-500" },
]

export interface StationManagementProps {
  role?: "admin" | "owner"
}

export default function StationManagement({ role: explicitRole }: StationManagementProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const { stations, pagination, isLoading, error, fetchStations } = useStationStore()
  const user = useAuthStore((state) => state.user)

  // Determine active view mode role (explicit prop > auth user role > route path check)
  const isAdmin = useMemo(() => {
    if (explicitRole) return explicitRole === "admin"
    if (user?.role === "admin") return true
    return location.pathname.startsWith("/admin")
  }, [explicitRole, user?.role, location.pathname])

  // URL-driven query & tab state (primarily used for Admin Data Table view)
  const searchQuery = searchParams.get("q") || ""
  const activeTab = searchParams.get("tab") || "all"
  const currentPage = Number(searchParams.get("page")) || 1
  const limit = 10

  // Fetch station list
  const loadStations = useCallback(async () => {
    let statusFilter: string | undefined = undefined
    if (activeTab === "pending") {
      statusFilter = STATION_STATUS.PENDING_REVIEW
    } else if (activeTab === "active") {
      statusFilter = STATION_STATUS.ACTIVE
    } else if (activeTab === "inactive") {
      statusFilter = STATION_STATUS.INACTIVE
    } else if (activeTab === "suspended") {
      statusFilter = STATION_STATUS.SUSPENDED
    } else if (activeTab === "rejected") {
      statusFilter = STATION_STATUS.REJECTED
    } else {
      statusFilter = "all"
    }

    if (isAdmin) {
      await fetchStations({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        status: statusFilter,
      })
    } else {
      const ownerUserId = user?.ownerId || user?.id
      if (ownerUserId) {
        await fetchStations({
          ownerId: ownerUserId,
          status: statusFilter,
        })
      }
    }
  }, [isAdmin, activeTab, currentPage, searchQuery, user?.ownerId, user?.id, fetchStations])

  useEffect(() => {
    loadStations()
  }, [loadStations])

  // URL query parameter updater (for Admin Table search, tabs, and pagination)
  const updateParams = (newParams: Record<string, string | null | number | boolean>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === "" || val === false) {
        params.delete(key)
      } else {
        params.set(key, String(val))
      }
    })
    if (!Object.prototype.hasOwnProperty.call(newParams, "page")) {
      params.delete("page")
    }
    setSearchParams(params, { replace: true })
  }

  // --- Admin Specific DataTable Columns ---
  const adminColumns: Column<Station>[] = [
    {
      id: "info",
      header: "Station Info",
      cell: (station) => (
        <div
        onClick={() => navigate(`/admin/stations/${station.id}`)}
         className="flex items-center gap-3 hover:cursor-pointer">
          <img
            src={
              station.images?.find((img) => img.isPrimary)?.url ||
              station.images?.[0]?.url ||
              "https://placehold.co/100x100/1a2240/60a5fa?text=Wash"
            }
            alt={station.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
          />
          <div
            className="flex flex-col text-left"
          >
            <span className="font-semibold hover:text-primary text-foreground leading-none mb-1">
              {station.name || "Unnamed Station"}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin size={11} />
              {station.address?.city || "Unknown City"}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: (station) => (
        <div className="flex flex-col text-left text-xs text-muted-foreground gap-0.5">
          <span className="flex items-center gap-1.5">
            <Phone size={12} className="text-muted-foreground" />
            {station.contact?.phone || "N/A"}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail size={12} className="text-muted-foreground" />
            {station.contact?.email || "N/A"}
          </span>
        </div>
      ),
    },
    {
      id: "bays",
      header: "Capacity",
      cell: (station) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Layers size={13} className="text-muted-foreground" />
          <span>{station.slotConfig?.bays || 0} Bays</span>
          <span className="text-muted-foreground">•</span>
          <span>{station.slotConfig?.windowDurationMins || 0} mins</span>
        </div>
      ),
    },
    {
      id: "rating",
      header: "Rating",
      cell: (station) => (
        <div className="flex items-center gap-1">
          <Star size={13} className="fill-amber-500 text-amber-500" />
          <span className="text-xs font-semibold text-muted-foreground ">
            {station.rating ? station.rating.toFixed(1) : "0.0"}
          </span>
          <span className="text-[10px] text-muted-foreground">({station.reviewCount || 0})</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (station) => {
        let badgeStyle = "bg-slate-500/10 text-slate-500 border-slate-500/20"
        let dotStyle = "bg-slate-500"

        switch (station.status) {
          case STATION_STATUS.ACTIVE:
            badgeStyle = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            dotStyle = "bg-emerald-500"
            break
          case STATION_STATUS.PENDING_REVIEW:
            badgeStyle = "bg-amber-500/10 text-amber-500 border-amber-500/20"
            dotStyle = "bg-amber-500"
            break
          case STATION_STATUS.SUSPENDED:
            badgeStyle = "bg-amber-500/10 text-amber-500 border-amber-500/20"
            dotStyle = "bg-amber-500"
            break
          case STATION_STATUS.REJECTED:
            badgeStyle = "bg-red-500/10 text-red-500 border-red-500/20"
            dotStyle = "bg-red-500"
            break
          case STATION_STATUS.DRAFT:
            badgeStyle = "bg-blue-500/10 text-blue-500 border-blue-500/20"
            dotStyle = "bg-blue-500"
            break
        }

        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeStyle}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
            {station.status}
          </span>
        )
      },
    }
  ]

  // Admin Stats Count HUD Calculation
  const totalCount = pagination?.total ?? stations.length
  const pendingCount = stations.filter((s) => s.status === STATION_STATUS.PENDING_REVIEW).length
  const activeCount = stations.filter((s) => s.status === STATION_STATUS.ACTIVE).length
  const rejectedCount = stations.filter((s) => s.status === STATION_STATUS.REJECTED).length

  const adminStationStats: StatItem[] = [
    {
      id: "pending",
      label: "Pending Review",
      value: pendingCount,
      variant: "amber",
      icon: AlertTriangle,
      onClick: () => updateParams({ tab: "pending" }),
    },
    {
      id: "active",
      label: "Active Stations",
      value: activeCount,
      variant: "emerald",
      icon: CheckCircle2,
      onClick: () => updateParams({ tab: "active" }),
    },
    {
      id: "rejected",
      label: "Rejected",
      value: rejectedCount,
      variant: "red",
      icon: XCircle,
      onClick: () => updateParams({ tab: "rejected" }),
    },
    {
      id: "total",
      label: "Total Stations",
      value: totalCount,
      variant: "blue",
      icon: Layers,
      onClick: () => updateParams({ tab: "all" }),
    },
  ]

  const paginationMeta = {
    total: totalCount,
    page: currentPage,
    limit,
    totalPages: pagination?.totalPages || Math.ceil(totalCount / limit) || 1,
    hasNextPage: pagination?.hasNextPage ?? currentPage * limit < totalCount,
    hasPrevPage: pagination?.hasPrevPage ?? currentPage > 1,
  }

  // ==========================================
  // RENDER: ADMIN VIEW (Data Table + Stats HUD)
  // ==========================================
  if (isAdmin) {
    return (
      <div className="space-y-6 text-left animate-in fade-in duration-300 min-h-screen">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[{ label: "Admin", path: "/admin/dashboard" }, { label: "Station Management" }]}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Stations Approval</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Review layout, pricing models, amenities, and verify station registration details.
            </p>
          </div>
        </div>

        {/* Stats HUD */}
        <StatsHUD stats={adminStationStats} />

        {/* DataTable View */}
        <DataTable<Station>
          columns={adminColumns}
          data={stations}
          rowKey={(s) => s.id}
          searchQuery={searchQuery}
          onSearchChange={(q) => updateParams({ q })}
          searchLabel="Search Stations"
          searchPlaceholder="Name or city..."
          tabs={ADMIN_TABS}
          activeTab={activeTab}
          onTabChange={(tab) => updateParams({ tab })}
          isLoading={isLoading}
          loadingText="Fetching station list..."
          errorMsg={error}
          emptyMessage="No stations found."
          pagination={paginationMeta}
          onPageChange={(p) => updateParams({ page: p })}
        />
      </div>
    )
  }

  // ==========================================
  // RENDER: OWNER VIEW (Card Grid View)
  // ==========================================
  return (
    <div className="space-y-6 min-h-screen animate-in fade-in duration-300">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Owner", path: "/owner/dashboard" }, { label: "Stations" }]} />

      {/* Header */}qq

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Stations Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Maintain and Manage all your stations.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAdmin && user && !user.isVerified) {
              return
            }
            navigate("/owner/stations/new")
          }}
          disabled={!isAdmin && user ? !user.isVerified : false}
          title={!isAdmin && user && !user.isVerified ? "Account pending admin approval" : "Create Station"}
          className={`flex items-center gap-2 font-semibold px-4.5 py-2.5 rounded-xl transition-all shadow-md select-none ${
            !isAdmin && user && !user.isVerified
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              : "bg-primary hover:opacity-90 text-primary-foreground hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Create Station</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-6 border-b border-border/40 pb-2 overflow-x-auto">
        {OWNER_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <div
              key={tab.id}
              onClick={() => updateParams({ tab: tab.id })}
              className={`relative pb-2 text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors duration-200 ${
                isActive
                  ? "text-primary font-bold border-b-2 border-primary -mb-[9px]"
                  : "text-muted-foreground hover:text-foreground border-b-2 border-transparent -mb-[9px]"
              }`}
            >
              {tab.label}
            </div>
          )
        })}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm border border-red-500/20">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-80 rounded-3xl bg-muted/40 animate-pulse border border-border"
            />
          ))}
        </div>
      ) : (
        /* Responsive Card Grid */
        <div
          key={activeTab}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2 animate-in fade-in slide-in-from-bottom-3 duration-300 ease-out"
        >
          {stations.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center min-h-[40vh] space-y-2 py-12">
              <p className="text-foreground font-semibold text-lg">No stations found</p>
              <p className="text-sm text-muted-foreground max-w-sm text-center">
                {!isAdmin && user && !user.isVerified
                  ? "Station creation will unlock once your partner application is approved by an administrator."
                  : "No stations match the selected filter."}
              </p>
            </div>
          ) : (

            stations.map((station) => (
              <StationCard
                key={station.id}
                id={station.id}
                name={station.name}
                showFavoriteButton={false}
                image={
                  station.images?.find((img) => img.isPrimary)?.url ||
                  station.images?.[0]?.url ||
                  "https://placehold.co/400x200/1a2240/60a5fa?text=Wash+Station"
                }
                address={`${station.address?.street || ""}, ${station.address?.city || ""}`}
                status={station.status}
                rating={station.rating || 0}
                reviewCount={station.reviewCount || 0}
                queueCount={0}
                baysCount={station.slotConfig?.bays || 0}
                operatingHours={
                  station.operatingHours?.[0]
                    ? `${station.operatingHours[0].open} - ${station.operatingHours[0].close}`
                    : "Not Set"
                }
                services={station.amenities || []}
                onPrimaryAction={() => {
                  if (
                    station.status === STATION_STATUS.DRAFT ||
                    station.status === STATION_STATUS.REJECTED
                  ) {
                    navigate(`/owner/stations/${station.id}/edit`)
                  } else {
                    navigate(`/owner/stations/${station.id}`)
                  }
                }}
                onClick={() => navigate(`/owner/stations/${station.id}`)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
