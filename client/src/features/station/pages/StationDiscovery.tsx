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
  Crosshair,
  Loader2,
  Car,
  Sparkles,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react"
import StationCard from "@/shared/components/cards/StationCard"
import { useStationStore } from "@/features/station/store/station.store"
import { useVehicleStore } from "@/features/vehicle/store/vehicle.store"
import { StationFilterModal } from "../components/station-discovery/StationFilterModal"
import StationDiscoveryMap from "../components/station-discovery/StationDiscoveryMap"
import LocationAutocomplete from "../components/station-discovery/LocationAutocomplete"
import { DEFAULT_FILTERS, type FilterOptions, type Station } from "@/features/station/types"
import { useDebounce } from "@/shared/hooks/useDebounce"
import Pagination from "@/shared/components/ui/Pagination"
import { useAuthStore } from "@/features/auth/store/auth.store"

const StationDiscovery = () => {
  const navigate = useNavigate()
  const { stations, pagination, isLoading, error, fetchStations } = useStationStore()
  const { vehicles, loadVehicles } = useVehicleStore()
  const user = useAuthStore()

  // Load user vehicles if logged in
  useEffect(() => {
    if (user.isAuthenticated && vehicles.length === 0) {
      loadVehicles()
    }
  }, [user.isAuthenticated, vehicles.length, loadVehicles])

  // View state
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  )
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // Selected Vehicle details
  const selectedVehicleObj = useMemo(() => {
    if (!filters.selectedVehicleId) return null
    return vehicles.find((v) => v.id === filters.selectedVehicleId)
  }, [vehicles, filters.selectedVehicleId])

  const selectedVehicleName = selectedVehicleObj
    ? selectedVehicleObj.nickname || `${selectedVehicleObj.brand} ${selectedVehicleObj.model}`
    : undefined

  // Debounce search query input
  const debouncedSearch = useDebounce(searchQuery, 400)

  // Trigger HTML5 Geolocation to get user coordinates (only on manual user click)
  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.")
      return
    }
    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6))
        const lng = parseFloat(position.coords.longitude.toFixed(6))
        setUserLocation({ latitude: lat, longitude: lng })
        setIsLocating(false)
        setPage(1)
      },
      (err) => {
        setIsLocating(false)
        if (err.code === 1) {
          setLocationError(
            "Location permission denied. Please allow location access for nearest station results."
          )
        } else {
          setLocationError("Could not retrieve your location. Try again.")
        }
      },
      { timeout: 5000, enableHighAccuracy: true }
    )
  }, [])

  // Fetch stations from backend on mount or filter/search/page changes
  const loadData = useCallback(async () => {
    await fetchStations({
      page,
      limit: 12,
      search: debouncedSearch.trim() || undefined,
      latitude: userLocation?.latitude,
      longitude: userLocation?.longitude,
      maxDistanceKm: filters.maxDistanceKm,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
      vehicleCategory: filters.vehicleCategory !== "all" ? filters.vehicleCategory : undefined,
      vehicleClassId: filters.vehicleClassId,
      washType: filters.washType && filters.washType !== "ALL" ? filters.washType : undefined,
      sortBy: filters.sortBy,
    })
  }, [fetchStations, page, debouncedSearch, userLocation, filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Clear active user location
  const handleClearLocation = () => {
    setUserLocation(null)
    setLocationError(null)
    setPage(1)
  }

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.sortBy !== DEFAULT_FILTERS.sortBy) count++
    if (filters.vehicleCategory !== DEFAULT_FILTERS.vehicleCategory) count++
    if (filters.vehicleClassId) count++
    if (filters.selectedVehicleId) count++
    if (filters.maxDistanceKm !== DEFAULT_FILTERS.maxDistanceKm) count++
    if (filters.minRating > 0) count++
    if (userLocation) count++
    return count
  }, [filters, userLocation])

  const handleResetFilters = () => {
    setSearchQuery("")
    setUserLocation(null)
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  const getSortLabel = () => {
    switch (filters.sortBy) {
      case "RATING":
      case "rating":
        return "Highest Rated"
      case "WAIT_TIME":
      case "fastest":
        return "Fastest Service"
      case "PRICE_LOW_TO_HIGH":
        return "Price: Low to High"
      case "PRICE_HIGH_TO_LOW":
        return "Price: High to Low"
      case "DISTANCE":
      case "nearest":
        return "Nearest First"
      case "RECOMMENDED":
      default:
        return "Recommended"
    }
  }

  return (
    <div className="min-h-screen pt-4 sm:pt-8 pb-24 px-6 sm:px-12 lg:px-16 w-full max-w-full space-y-8 relative">
      {/* Top Header Section aligned to layout */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border/60 pb-6 text-left">
        <div className="shrink-0 space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground whitespace-nowrap">
            Find Wash Stations
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-medium">
            {pagination ? `${pagination.total} stations found` : `${stations.length} results`}
            {selectedVehicleName ? ` • Rate for ${selectedVehicleName}` : ""}
            {userLocation ? " • Nearby your location" : ` • ${filters.maxDistanceKm}km radius`}
          </p>
        </div>

        {/* Right Side Controls: Search Bar & View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
          {/* Main Search Input */}
          <LocationAutocomplete
            value={searchQuery}
            onChange={setSearchQuery}
            onLocationSelect={(location) => {
              setUserLocation(location)
              setLocationError(null)
              setPage(1)
            }}
            className="sm:w-[280px] lg:w-[320px]"
          />

          {/* Location Trigger Button */}
          <button
            onClick={userLocation ? handleClearLocation : handleGetLocation}
            disabled={isLocating}
            title={userLocation ? "Clear location filter" : "Find stations near me"}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none shrink-0 ${userLocation
                ? "bg-primary/10 border-primary text-primary shadow-sm"
                : "bg-card border-border hover:bg-muted text-foreground"
              }`}
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : userLocation ? (
              <>
                <MapPin className="w-4 h-4 text-primary" />
                <span>Near Me (Active)</span>
                <X className="w-3.5 h-3.5 ml-1 opacity-70 hover:opacity-100" />
              </>
            ) : (
              <>
                <Crosshair className="w-4 h-4 text-primary" />
                <span>Use My Location</span>
              </>
            )}
          </button>

          {/* Sort Dropdown Selector */}
          <div className="relative flex items-center shrink-0">
            <ArrowUpDown className="w-4 h-4 text-primary absolute left-3.5 pointer-events-none" />
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as FilterOptions["sortBy"],
                }))
              }
              className="pl-9 pr-8 py-2.5 rounded-full bg-card border border-border text-foreground text-xs sm:text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer transition-all shadow-sm"
            >
              <option value="RECOMMENDED">Sort: Recommended</option>
              <option value="DISTANCE">Sort: Nearest First</option>
              <option value="RATING">Sort: Highest Rated</option>
              <option value="WAIT_TIME">Sort: Fastest Service</option>
              <option value="PRICE_LOW_TO_HIGH">Sort: Price Low to High</option>
              <option value="PRICE_HIGH_TO_LOW">Sort: Price High to Low</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 pointer-events-none" />
          </div>

          {/* Filter Modal Trigger Button */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none shrink-0 ${activeFilterCount > 0
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                : "bg-card border-border hover:bg-muted text-foreground"
              }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary-foreground text-primary font-black text-[11px] flex items-center justify-center ml-0.5">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Map View Convert Toggle Button */}
          <button
            onClick={() => setViewMode((prev) => (prev === "grid" ? "map" : "grid"))}
            className="flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full border border-border bg-card hover:bg-muted text-foreground text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md cursor-pointer select-none shrink-0"
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

      {/* Registered User Vehicles Quick Filter Pill Bar */}
      {user.isAuthenticated && vehicles.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-semibold text-xs shrink-0 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            My Vehicles:
          </span>
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                selectedVehicleId: undefined,
                vehicleClassId: undefined,
              }))
            }
            className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold shrink-0 transition-all cursor-pointer ${!filters.selectedVehicleId
                ? "bg-primary/10 border-primary text-primary shadow-sm"
                : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            All Vehicles
          </button>
          {vehicles.map((v) => {
            const isSelected = filters.selectedVehicleId === v.id
            return (
              <button
                key={v.id}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    selectedVehicleId: isSelected ? undefined : v.id,
                    vehicleClassId: isSelected ? undefined : v.classId,
                    vehicleCategory: isSelected ? "all" : v.categoryId,
                  }))
                }
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold shrink-0 transition-all cursor-pointer ${isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>{v.nickname || `${v.brand} ${v.model}`}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Location Permission / Error Alert */}
      {locationError && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs sm:text-sm">
          <span>{locationError}</span>
          <button
            onClick={() => setLocationError(null)}
            className="text-xs font-bold underline hover:opacity-80 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Nearest Sort Location Prompt */}
      {(filters.sortBy === "nearest" || filters.sortBy === "DISTANCE") &&
        !userLocation &&
        !locationError && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                Nearest sorting requires your location. Enable location to calculate accurate
                station distance.
              </span>
            </div>
            <button
              onClick={handleGetLocation}
              disabled={isLocating}
              className="px-4 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLocating ? "Locating…" : "Enable Location"}
            </button>
          </div>
        )}

      {/* {/* Active Filter Pills Tag Bar */}
      {/* {(activeFilterCount > 0  || searchQuery) && (
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

          {selectedVehicleName && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground border border-primary/20 font-bold">
              Vehicle: {selectedVehicleName}
              <X
                className="w-3.5 h-3.5 cursor-pointer hover:opacity-80"
                onClick={() =>
                  setFilters((p) => ({
                    ...p,
                    selectedVehicleId: undefined,
                    vehicleClassId: undefined,
                  }))
                }
              />
            </span>
          )}

          {userLocation && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              Location Filter Active
              <X
                className="w-3.5 h-3.5 cursor-pointer hover:opacity-80"
                onClick={handleClearLocation}
              />
            </span>
          )}

          {filters.sortBy !== DEFAULT_FILTERS.sortBy && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-foreground font-medium">
              Sort: {getSortLabel()}
              <X
                className="w-3.5 h-3.5 cursor-pointer hover:text-primary"
                onClick={() =>
                  setFilters((p: FilterOptions) => ({ ...p, sortBy: DEFAULT_FILTERS.sortBy }))
                }
              />
            </span>
          )}

          {filters.vehicleCategory !== "all" && !selectedVehicleName && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-foreground font-medium">
              Category Filter Active
              <X
                className="w-3.5 h-3.5 cursor-pointer hover:text-primary"
                onClick={() => setFilters((p: FilterOptions) => ({ ...p, vehicleCategory: "all" }))}
              />
            </span>
          )}

          {filters.minRating > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-foreground font-medium">
              {filters.minRating}+ Stars
              <X
                className="w-3.5 h-3.5 cursor-pointer hover:text-primary"
                onClick={() => setFilters((p: FilterOptions) => ({ ...p, minRating: 0 }))}
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
      )} */}

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
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-96 rounded-3xl bg-muted/40 animate-pulse border border-border"
            />
          ))}
        </div>
      ) : stations.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              No stations found
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              We couldn't find any wash stations matching your vehicle or filters. Try selecting a
              different vehicle or clearing active filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all cursor-pointer shadow-md"
          >
            Reset Filters & Search
          </button>
        </div>
      ) : viewMode === "map" ? (
        /* Interactive Map View Mode */
        <StationDiscoveryMap
          stations={stations}
          userLocation={userLocation}
          onStationSelect={(id) => navigate(`/stations/${id}`)}
        />
      ) : (
        /* Responsive Stations Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stations.map((station: Station) => (
            <StationCard
              key={station.id}
              id={station.id}
              name={station.name}
              image={
                station.images?.find((img: { isPrimary: boolean; url: string }) => img.isPrimary)
                  ?.url ||
                station.images?.[0]?.url ||
                "https://placehold.co/400x200/1a2240/60a5fa?text=Wash+Station"
              }
              address={`${station.address?.street || ""}, ${station.address?.city || ""}`}
              status={station.status}
              rating={station.rating || 0.0}
              reviewCount={station.reviewCount || 0}
              queueCount={station.queueDepth ?? 0}
              baysCount={station.slotConfig?.bays || 0}
              services={station.amenities || ["Basic Wash", "Full Wash", "Interior Clean"]}
              categories={["Car", "Bike", "SUV"]}
              distanceKm={station.distanceKm}
              startingPrice={station.startingPrice}
              halfWashPrice={station.halfWashPrice}
              fullWashPrice={station.fullWashPrice}
              selectedVehicleName={selectedVehicleName}
              primaryActionLabel="View Details"
              isFavorite={station.isFavorite}
              showFavoriteButton={user.isAuthenticated}
              onClick={() => navigate(`/stations/${station.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && (
        <div className="pt-6 border-t border-border/60">
          <Pagination meta={pagination} onPageChange={setPage} />
        </div>
      )}

      {/* Floating Capsule Filter & Sort Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div
          onClick={() => setIsFilterModalOpen(true)}
          className="flex items-center gap-4 px-6 py-3.5 rounded-full bg-card/95 hover:bg-card border border-border hover:border-primary/50 text-foreground shadow-2xl backdrop-blur-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 select-none group"
        >
          {/* Left Side: Filter & Sort Trigger */}
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-bold text-foreground">Filter & Sort</span>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[11px] font-black px-2 py-0.5 rounded-full shadow-xs">
                {activeFilterCount}
              </span>
            )}
          </div>

          {/* Divider line */}
          <div className="h-4 w-px bg-border" />

          {/* Right Side: Active Sort Indicator */}
          <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">
            {getSortLabel()}
          </span>
        </div>
      </div>

      {/* Bottom Sheet Filter Modal */}
      <StationFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilters={filters}
        onApplyFilters={(newFilters) => {
          setFilters(newFilters)
          setPage(1)
          if (newFilters.sortBy === "nearest" && !userLocation) {
            handleGetLocation()
          }
        }}
        onResetFilters={handleResetFilters}
      />
    </div>
  )
}

export default StationDiscovery
