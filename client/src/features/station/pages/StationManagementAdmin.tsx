import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Mail, Phone, MapPin, Eye, Clock, Layers, Star } from "lucide-react"
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
  const { stations, isLoading, error, fetchStations, reviewStation, fetchStationById, selectedStation, clearSelected } = useStationStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [localSelectedStation, setLocalSelectedStation] = useState<Station | null>(null)
  
  // Modal states for rejection
  const [rejectingStationId, setRejectingStationId] = useState<string | null>(null)
  const [rejectionReasonInput, setRejectionReasonInput] = useState("")

  // URL-driven query & tab state
  const searchQuery = searchParams.get("q") || ""
  const activeTab = searchParams.get("tab") || "all"
  const currentPage = Number(searchParams.get("page")) || 1
  const limit = 10

  const loadStations = useCallback(async () => {
    // We can filter by status using getStations API
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

  // Helper to fetch details when slide-over opens
  const handleOpenDetails = async (station: Station) => {
    setLocalSelectedStation(station)
    await fetchStationById(station.id)
  }

  const handleCloseDetails = () => {
    setLocalSelectedStation(null)
    clearSelected()
  }

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

  // Action: Approve
  const handleApprove = async (id: string) => {
    const success = await reviewStation(id, "APPROVE")
    if (success) {
      if (localSelectedStation?.id === id) {
        // Refresh local details
        await fetchStationById(id)
      }
      loadStations()
    }
  }

  // Action: Reject
  const handleReject = async (id: string, reason: string) => {
    const success = await reviewStation(id, "REJECT", reason)
    if (success) {
      setRejectingStationId(null)
      setRejectionReasonInput("")
      if (localSelectedStation?.id === id) {
        await fetchStationById(id)
      }
      loadStations()
    }
  }

  // Stats calculation
  const totalCount = stations.length
  const pendingCount = stations.filter(s => s.status === STATION_STATUS.PENDING_REVIEW).length
  const activeCount = stations.filter(s => s.status === STATION_STATUS.ACTIVE).length
  const rejectedCount = stations.filter(s => s.status === STATION_STATUS.REJECTED).length

  // Columns definition
  const columns: Column<Station>[] = [
    {
      id: "info",
      header: "Station Info",
      cell: (station) => (
        <div className="flex items-center gap-3">
          <img
            src={station.images?.find(img => img.isPrimary)?.url || station.images?.[0]?.url || "https://placehold.co/100x100/1a2240/60a5fa?text=Wash"}
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
            onClick={() => handleOpenDetails(station)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-xs font-bold tracking-wide transition-all cursor-pointer text-slate-300 hover:text-white"
          >
            <Eye size={12} />
            Review
          </button>
        </div>
      ),
    },
  ]

  // Pagination metadata mock/derived from stations count
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
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Review</span>
            <p className="text-3xl font-bold text-amber-500">{pendingCount}</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* Active Stations */}
        <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-800/80 bg-card/65 backdrop-blur-sm">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Stations</span>
            <p className="text-3xl font-bold text-emerald-500">{activeCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Rejected Stations */}
        <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-800/80 bg-card/65 backdrop-blur-sm">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rejected</span>
            <p className="text-3xl font-bold text-red-500">{rejectedCount}</p>
          </div>
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
            <XCircle size={22} />
          </div>
        </div>

        {/* Total Stations */}
        <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-800/80 bg-card/65 backdrop-blur-sm">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Stations</span>
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

      {/* Slide-over Application Details Panel */}
      {localSelectedStation && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div onClick={handleCloseDetails} className="absolute inset-0 cursor-pointer" />
          <div className="relative w-full max-w-xl bg-card border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-100 tracking-tight">
                  Station Specifications
                </h2>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Details &amp; verification criteria
                </p>
              </div>
              <button
                onClick={handleCloseDetails}
                className="w-8 h-8 rounded-full border border-slate-800 hover:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Meta */}
              <div className="space-y-4">
                <img
                  src={localSelectedStation.images?.find(img => img.isPrimary)?.url || localSelectedStation.images?.[0]?.url || "https://placehold.co/600x300/1a2240/60a5fa?text=Wash"}
                  alt={localSelectedStation.name}
                  className="w-full h-44 rounded-2xl object-cover border border-slate-800"
                />
                
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{localSelectedStation.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{localSelectedStation.description || "No description provided."}</p>
                </div>
              </div>

              {/* Status Banner */}
              {localSelectedStation.status === STATION_STATUS.REJECTED && localSelectedStation.rejectionReason && (
                <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-2xl text-sm text-red-400 flex flex-col gap-1">
                  <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Rejection Feedback
                  </span>
                  <p className="text-xs font-semibold">{localSelectedStation.rejectionReason}</p>
                </div>
              )}

              {/* Specifications Sections */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Contact Details</span>
                  <div className="text-xs space-y-1 text-slate-300">
                    <p className="truncate">📞 {localSelectedStation.contact?.phone || "N/A"}</p>
                    <p className="truncate">✉️ {localSelectedStation.contact?.email || "N/A"}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Operational Slot Info</span>
                  <div className="text-xs space-y-1 text-slate-300">
                    <p>Bays Count: {localSelectedStation.slotConfig?.bays || 0}</p>
                    <p>Window Duration: {localSelectedStation.slotConfig?.windowDurationMins || 0} mins</p>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Physical Address</span>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>{localSelectedStation.address?.street}</p>
                  <p>{localSelectedStation.address?.city}, {localSelectedStation.address?.state} - {localSelectedStation.address?.pincode}</p>
                  <p className="text-slate-500 text-[10px]">Coordinates: {localSelectedStation.location?.latitude}, {localSelectedStation.location?.longitude}</p>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Amenities &amp; Features</span>
                <div className="flex flex-wrap gap-2">
                  {localSelectedStation.amenities && localSelectedStation.amenities.length > 0 ? (
                    localSelectedStation.amenities.map((amenity, idx) => (
                      <span key={idx} className="bg-slate-950/65 text-slate-300 border border-slate-800/80 px-3 py-1.5 rounded-xl text-xs font-semibold">
                        {amenity}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 font-semibold italic">No amenities specified</span>
                  )}
                </div>
              </div>

              {/* Pricing details if selectedStation is populated */}
              {selectedStation && selectedStation.pricing && selectedStation.pricing.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Wash Tiers Pricing</span>
                  <div className="border border-slate-850 rounded-2xl overflow-hidden divide-y divide-slate-800/60 bg-slate-900/10">
                    {selectedStation.pricing.map((price, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 text-xs text-slate-300">
                        <span className="font-semibold text-slate-400">Vehicle Class: {price.vehicleClassId}</span>
                        <div className="space-x-4">
                          <span>Half Wash: <strong className="text-primary">₹{price.halfWashPrice}</strong></span>
                          <span>Full Wash: <strong className="text-primary">₹{price.fullWashPrice}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="p-6 border-t border-slate-800 flex items-center gap-4 bg-muted/10">
              {localSelectedStation.status === STATION_STATUS.PENDING_REVIEW ? (
                <>
                  <button
                    onClick={() => handleApprove(localSelectedStation.id)}
                    className="flex-grow inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black text-xs tracking-wider uppercase transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <CheckCircle2 size={14} />
                    Approve Station
                  </button>
                  <button
                    onClick={() => {
                      setRejectingStationId(localSelectedStation.id)
                      setRejectionReasonInput("")
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-500 font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                </>
              ) : localSelectedStation.status === STATION_STATUS.ACTIVE ? (
                <div className="w-full py-3 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 rounded-xl text-center text-xs font-black uppercase tracking-wider select-none flex items-center justify-center gap-1.5">
                  <ShieldCheck size={16} />
                  Active &amp; Approved
                </div>
              ) : (
                <div className="w-full py-3 border border-slate-800 bg-slate-900/20 text-slate-400 rounded-xl text-center text-xs font-bold uppercase tracking-wider select-none">
                  Status: {localSelectedStation.status}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Rejection Reason Modal */}
      {rejectingStationId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
                  Reject Station Registration
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Specify feedback for the car wash partner
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Operating hours are invalid, or pricing entries contain negative figures. Please rectify..."
                  className="w-full h-32 bg-muted/90 text-foreground border border-slate-800 rounded-xl p-4 text-sm placeholder-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setRejectingStationId(null)}
                  className="flex-1 py-3 border border-slate-800 hover:bg-slate-900/60 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={!rejectionReasonInput.trim()}
                  onClick={() => handleReject(rejectingStationId, rejectionReasonInput.trim())}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Reject Station
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
