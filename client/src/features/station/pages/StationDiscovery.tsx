import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  SlidersHorizontal,
  MapPin,
  RefreshCw,
  X,
  Map as MapIcon,
  LayoutGrid,
  Search,
} from "lucide-react"
import StationCard from "@/shared/components/cards/StationCard"
import { useStationStore } from "@/features/station/store/stationStore"
import {
  StationFilterModal,
  type FilterOptions,
  DEFAULT_FILTERS,
} from "../components/station-discovery/StationFilterModal"
import { STATION_STATUS, type Station } from "@/features/station/types"

const StationDiscovery = () => {
  const navigate = useNavigate()
  const { stations, isLoading, error, fetchStations } = useStationStore()

  // View state
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS)

  // Fetch stations on mount
  const loadData = useCallback(async () => {
    await fetchStations()
  }, [fetchStations])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.sortBy !== DEFAULT_FILTERS.sortBy) count++
    if (filters.vehicleCategory !== DEFAULT_FILTERS.vehicleCategory) count++
    if (filters.maxDistanceKm !== DEFAULT_FILTERS.maxDistanceKm) count++
    if (filters.minRating > 0) count++
    return count
  }, [filters])

  // Filter & Sort Logic applied on stations list
  const filteredStations = useMemo(() => {
    return stations
      .filter((st: Station) => {
        // Must be active for customer view
        if (st.status && st.status !== STATION_STATUS.ACTIVE) {
          return false
        }

        // Text Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchName = st.name.toLowerCase().includes(q)
          const matchAddr = `${st.address?.street || ""} ${st.address?.city || ""} ${st.address?.state || ""}`
            .toLowerCase()
            .includes(q)
          if (!matchName && !matchAddr) return false
        }

        // Minimum Rating Filter
        if (filters.minRating > 0 && (st.rating || 0) < filters.minRating) {
          return false
        }

        return true
      })
      .sort((a: Station, b: Station) => {
        if (filters.sortBy === "rating") {
          return (b.rating || 0) - (a.rating || 0)
        }
        if (filters.sortBy === "popular") {
          return (b.reviewCount || 0) - (a.reviewCount || 0)
        }
        return a.name.localeCompare(b.name)
      })
  }, [stations, searchQuery, filters])

  const handleResetFilters = () => {
    setSearchQuery("")
    setFilters(DEFAULT_FILTERS)
  }

  const getSortLabel = () => {
    switch (filters.sortBy) {
      case "rating":
        return "Highest Rated"
      case "fastest":
        return "Fastest Service"
      case "popular":
        return "Most Popular"
      default:
        return "Nearest First"
    }
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-24 px-6 sm:px-12 lg:px-16 w-full max-w-full space-y-8 relative">
      {/* Top Header Section aligned to layout without overlapping fixed header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Find Wash Stations
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1.5 font-medium">
            {filteredStations.length} results • {filters.maxDistanceKm}km radius
          </p>
        </div>

        {/* Right Side Controls: Map Toggle Button */}
        <div className="flex items-center gap-3">
          {/* Map View Convert Toggle Button */}
          <button
            onClick={() => setViewMode((prev) => (prev === "grid" ? "map" : "grid"))}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full border border-border bg-card hover:bg-muted text-foreground text-sm font-semibold transition-all duration-200 shadow-md cursor-pointer select-none"
          >
            {viewMode === "grid" ? (
              <>
                <MapIcon className="w-4.5 h-4.5 text-primary" />
                <span>Map view</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-4.5 h-4.5 text-primary" />
                <span>Grid view</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Pills Tag Bar */}
      {(activeFilterCount > 0 || searchQuery) && (
        <div className="flex items-center flex-wrap gap-2 text-xs pt-1">
          <span className="text-muted-foreground font-medium mr-1">Active Filters:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
              Search: "{searchQuery}"
              <X
                className="w-3.5 h-3.5 cursor-pointer hover:opacity-80"
                onClick={() => setSearchQuery("")}
              />
            </span>
          )}

          {filters.sortBy !== DEFAULT_FILTERS.sortBy && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-foreground font-medium">
              Sort: {getSortLabel()}
              <X
                className="w-3.5 h-3.5 cursor-pointer hover:text-primary"
                onClick={() => setFilters((p) => ({ ...p, sortBy: DEFAULT_FILTERS.sortBy }))}
              />
            </span>
          )}

          {filters.vehicleCategory !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-foreground font-medium">
              Category Selected
              <X
                className="w-3.5 h-3.5 cursor-pointer hover:text-primary"
                onClick={() => setFilters((p) => ({ ...p, vehicleCategory: "all" }))}
              />
            </span>
          )}

          {filters.minRating > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-foreground font-medium">
              {filters.minRating}+ Stars
              <X
                className="w-3.5 h-3.5 cursor-pointer hover:text-primary"
                onClick={() => setFilters((p) => ({ ...p, minRating: 0 }))}
              />
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="text-xs text-muted-foreground hover:text-primary underline ml-2 font-medium cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <span>{error}</span>
          <button
            onClick={loadData}
            className="flex items-center gap-1 text-xs font-bold underline hover:opacity-80 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* View Content Section (Grid vs Map View) */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-muted/40 animate-pulse border border-border" />
          ))}
        </div>
      ) : filteredStations.length === 0 ? (
        /* Clean Unboxed Centered Empty State */
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              No stations found
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              We couldn't find any stations matching your search or filters. Try expanding your search criteria.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all cursor-pointer shadow-md"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "map" ? (
        /* Map View Mode */
        <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-border bg-card shadow-xl flex flex-col md:flex-row">
          {/* Map Interactive Canvas */}
          <div className="flex-1 bg-muted relative flex items-center justify-center p-6">
            <div className="text-center space-y-3 max-w-md">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Interactive Map View</h3>
              <p className="text-xs text-muted-foreground">
                Showing {filteredStations.length} available stations. Select a station pin to view queue status & book.
              </p>
            </div>
          </div>

          {/* Map Station Sidebar */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border bg-card p-4 overflow-y-auto max-h-[600px] space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Stations List ({filteredStations.length})
            </p>
            {filteredStations.map((station: Station) => (
              <div
                key={station.id}
                onClick={() => navigate(`/stations/${station.id}`)}
                className="p-3.5 rounded-2xl border border-border hover:border-primary/40 bg-muted/30 hover:bg-muted/60 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-foreground line-clamp-1">{station.name}</h4>
                  <span className="text-xs font-semibold text-amber-400">★ {station.rating?.toFixed(1) || "4.8"}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {station.address?.street || ""}, {station.address?.city || ""}
                </p>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-emerald-400 font-semibold">
                    {station.slotConfig?.bays || 4} Bays
                  </span>
                  <span className="text-primary font-bold">Book Wash →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Responsive Stations Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStations.map((station: Station) => (
            <StationCard
              key={station.id}
              id={station.id}
              name={station.name}
              image={
                station.images?.find((img: { isPrimary: boolean; url: string }) => img.isPrimary)?.url ||
                station.images?.[0]?.url ||
                "https://placehold.co/400x200/1a2240/60a5fa?text=Wash+Station"
              }
              address={`${station.address?.street || ""}, ${station.address?.city || ""}`}
              status={station.status}
              rating={station.rating || 4.8}
              reviewCount={station.reviewCount || 124}
              queueCount={3}
              baysCount={station.slotConfig?.bays || 4}
              services={station.amenities || ["Basic Wash", "Full Wash", "Interior Clean"]}
              categories={["Car", "Bike", "SUV"]}
              primaryActionLabel="Book Now"
              onClick={() => navigate(`/stations/${station.id}`)}
              onPrimaryAction={() => navigate(`/stations/${station.id}`)}
              onSecondaryAction={() => navigate(`/stations/${station.id}`)}
            />
          ))}
        </div>
      )}

      {/* Floating Capsule Filter & Sort Bar (Matching Figma Design) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div
          onClick={() => setIsFilterModalOpen(true)}
          className="flex items-center gap-4 px-6 py-3.5 rounded-full bg-[#1E293B]/90 hover:bg-[#1E293B] border border-blue-500/40 text-foreground shadow-2xl backdrop-blur-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 select-none group"
        >
          {/* Left Side: Filter & Sort Trigger */}
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-semibold text-white">Filter & Sort</span>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>

          {/* Divider line */}
          <div className="h-4 w-px bg-border/80" />

          {/* Right Side: Active Sort Indicator */}
          <span className="text-xs text-muted-foreground font-medium hover:text-white transition-colors">
            {getSortLabel()}
          </span>
        </div>
      </div>

      {/* Bottom Sheet Filter Modal */}
      <StationFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        onResetFilters={handleResetFilters}
      />
    </div>
  )
}

export default StationDiscovery