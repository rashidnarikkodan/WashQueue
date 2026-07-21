import { useEffect, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { CheckCircle2, XCircle, AlertTriangle, Mail, Phone, MapPin, Eye, Layers, Star } from "lucide-react"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import { useStationStore } from "../store/stationStore"
import type { Station } from "../types"
import { STATION_STATUS } from "../types"
import { DataTable, type Column, type TabConfig } from "@/shared/components/data-table"

// Tab definitions for filtering stations
const stationAdminTabs: TabConfig[] = [
  { id: "all", label: "All Stations" },
  { id: "pending", label: "Pending Review", activeColor: "border-amber-500 text-amber-500" },
  { id: "active", label: "Active Stations", activeColor: "border-emerald-500 text-emerald-500" },
  { id: "rejected", label: "Rejected", activeColor: "border-red-500 text-red-500" },
]

export default function StationManagementAdmin() {
  const navigate = useNavigate()
  const { stations, isLoading, error, fetchStations } = useStationStore()
  const [searchParams, setSearchParams] = useSearchParams()

  // URL-driven query & tab state
  const searchQuery = searchParams.get("q") || ""
  const activeTab = searchParams.get("tab") || "all"
  const currentPage = Number(searchParams.get("page")) || 1
  const limit = 10

  const loadStations = useCallback(async () => {
    let statusFilter: string | undefined = undefined
    if (activeTab === "pending") {
      statusFilter = STATION_STATUS.PENDING_REVIEW
    } else if (activeTab === "active") {
      statusFilter = STATION_STATUS.ACTIVE
    } else if (activeTab === "rejected") {
      statusFilter = STATION_STATUS.REJECTED
    }

    await fetchStations({
      page: currentPage,
      limit,
      search: searchQuery || undefined,
      status: statusFilter,
    })
  }, [currentPage, searchQuery, activeTab, fetchStations])

  useEffect(() => {
    loadStations()
  }, [loadStations])

  // URL param updater
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

  const setSearchQuery = (q: string) => updateParams({ q })
  const setActiveTab = (tab: string) => updateParams({ tab })
  const setCurrentPage = (page: number) => updateParams({ page })

  // Stats calculation
  const totalCount = stations.length
  const pendingCount = stations.filter((s) => s.status === STATION_STATUS.PENDING_REVIEW).length
  const activeCount = stations.filter((s) => s.status === STATION_STATUS.ACTIVE).length
  const rejectedCount = stations.filter((s) => s.status === STATION_STATUS.REJECTED).length

  // Columns definition
  const columns: Column<Station>[] = [
    {
      id: "info",
      header: "Station Info",
      cell: (station) => (
        <div className="flex items-center gap-3">
          <img
            src={
              station.images?.find((img) => img.isPrimary)?.url ||
              station.images?.[0]?.url ||
              "https://placehold.co/100x100/1a2240/60a5fa?text=Wash"
            }
            alt={station.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-800"
          />
          <div className="flex flex-col text-left">
            <span className="font-semibold text-foreground leading-none mb-1">
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
        <div className="flex flex-col text-left text-xs text-slate-400 gap-0.5">
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
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          <Layers size={13} className="text-muted-foreground" />
          <span>{station.slotConfig?.bays || 0} Bays</span>
          <span className="text-slate-600">•</span>
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
          <span className="text-xs font-semibold text-slate-200">{station.rating || "0.0"}</span>
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
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeStyle}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
            {station.status}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: (station) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/admin/stations/${station.id}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 text-xs font-bold tracking-wide transition-all cursor-pointer text-slate-300 hover:text-white"
          >
            <Eye size={12} />
            <span>Review Specifications</span>
          </button>
        </div>
      ),
    },
  ]

  const paginationMeta = {
    total: totalCount,
    page: currentPage,
    limit,
    totalPages: Math.ceil(totalCount / limit) || 1,
    hasNextPage: currentPage * limit < totalCount,
    hasPrevPage: currentPage > 1,
  }

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: "Admin", path: "/admin/dashboard" }, { label: "Station Management" }]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Stations Approval</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review layout, pricing models, amenities, and verify station registration details.
          </p>
        </div>
      </div>

      {/* Stats HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Pending Review */}
        <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-800/80 bg-card/65 backdrop-blur-sm">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Review
            </span>
            <p className="text-3xl font-bold text-amber-500">{pendingCount}</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* Active Stations */}
        <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-800/80 bg-card/65 backdrop-blur-sm">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Stations
            </span>
            <p className="text-3xl font-bold text-emerald-500">{activeCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Rejected Stations */}
        <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-800/80 bg-card/65 backdrop-blur-sm">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Rejected
            </span>
            <p className="text-3xl font-bold text-red-500">{rejectedCount}</p>
          </div>
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
            <XCircle size={22} />
          </div>
        </div>

        {/* Total Stations */}
        <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-800/80 bg-card/65 backdrop-blur-sm">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Stations
            </span>
            <p className="text-3xl font-bold text-slate-100">{totalCount}</p>
          </div>
          <div className="p-3 bg-slate-800/50 text-slate-400 rounded-xl">
            <Layers size={22} />
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable<Station>
        columns={columns}
        data={stations}
        rowKey={(s) => s.id}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchLabel="Search Stations"
        searchPlaceholder="Name or city..."
        tabs={stationAdminTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLoading={isLoading}
        loadingText="Fetching station list..."
        errorMsg={error}
        emptyMessage="No stations found."
        pagination={paginationMeta}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
