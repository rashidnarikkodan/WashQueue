import React, { useState, useEffect } from "react"
import { X, Star, Bike, Car, Truck, SlidersHorizontal, Check, Sparkles } from "lucide-react"
import { vehicleCatelogApi } from "@/shared/apis/catelog.api"
import { stationApi } from "@/shared/apis/station.api"
import { useVehicleStore } from "@/features/vehicle/store/vehicle.store"
import { useAuthStore } from "@/features/auth/store/auth.store"
import type { VehicleCategory } from "@/features/vehicle-catelog/types"
import { DEFAULT_FILTERS, type FilterOptions, type FilterMetadata } from "../../types"

interface StationFilterModalProps {
  isOpen: boolean
  onClose: () => void
  currentFilters: FilterOptions
  onApplyFilters: (filters: FilterOptions) => void
  onResetFilters: () => void
}

const SORT_OPTIONS: { id: FilterOptions["sortBy"]; label: string }[] = [
  { id: "RECOMMENDED", label: "Recommended" },
  { id: "DISTANCE", label: "Nearest First" },
  { id: "RATING", label: "Highest Rated" },
  { id: "WAIT_TIME", label: "Fastest Service" },
  { id: "PRICE_LOW_TO_HIGH", label: "Price: Low to High" },
  { id: "PRICE_HIGH_TO_LOW", label: "Price: High to Low" },
]

const DISTANCE_PRESETS = [2, 5, 10, 20, 50]

const RATING_OPTIONS = [
  { value: 5.0, label: "5.0 Star Rated" },
  { value: 4.0, label: "4.0+ Star Rated" },
  { value: 3.0, label: "3.0+ Star Rated" },
  { value: 1.0, label: "1.0+ Star Rated" },
  { value: 0, label: "Any Rating" },
]

export const StationFilterModal: React.FC<StationFilterModalProps> = ({
  isOpen,
  onClose,
  currentFilters,
  onApplyFilters,
  onResetFilters,
}) => {
  const { isAuthenticated } = useAuthStore()
  const { vehicles, loadVehicles } = useVehicleStore()
  const [draftFilters, setDraftFilters] = useState<FilterOptions>(currentFilters)
  const [isVisible, setIsVisible] = useState(false)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  const isRendered = isOpen || isVisible

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setDraftFilters(currentFilters)
    } else {
      setIsVisible(false)
    }
  }

  const [categories, setCategories] = useState<VehicleCategory[]>([])
  const [filterMetadata, setFilterMetadata] = useState<FilterMetadata | null>(null)
  const [loadingMetadata, setLoadingMetadata] = useState(false)

  useEffect(() => {
    const fetchMetadata = async () => {
      setLoadingMetadata(true)
      try {
        const [catData, metaData] = await Promise.all([
          vehicleCatelogApi.getCategories().catch(() => []),
          stationApi.getFilterOptions().catch(() => null),
        ])

        if (catData && catData.length > 0) {
          setCategories(catData.filter((c) => c.isActive !== false))
        }
        if (metaData) {
          setFilterMetadata(metaData)
        }
      } catch {
      } finally {
        setLoadingMetadata(false)
      }
    }

    if (isOpen) {
      fetchMetadata()
      if (isAuthenticated && vehicles.length === 0) {
        loadVehicles()
      }
    }
  }, [isOpen, isAuthenticated, vehicles.length, loadVehicles])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 20)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isRendered) return null

  const getActiveFilterCount = (): number => {
    let count = 0
    if (draftFilters.sortBy !== DEFAULT_FILTERS.sortBy) count++
    if (draftFilters.vehicleCategory !== DEFAULT_FILTERS.vehicleCategory) count++
    if (draftFilters.vehicleClassId) count++
    if (draftFilters.selectedVehicleId) count++
    if (draftFilters.maxDistanceKm !== DEFAULT_FILTERS.maxDistanceKm) count++
    if (draftFilters.minRating > 0) count++
    return count
  }

  const activeCount = getActiveFilterCount()

  const handleReset = () => {
    setDraftFilters(DEFAULT_FILTERS)
    onResetFilters()
  }

  const handleApply = () => {
    onApplyFilters(draftFilters)
    onClose()
  }

  const getCategoryIcon = (name: string, slug?: string) => {
    const term = `${name} ${slug || ""}`.toLowerCase()
    if (term.includes("bike") || term.includes("two") || term.includes("cycle")) return Bike
    if (term.includes("truck") || term.includes("heavy") || term.includes("bus")) return Truck
    return Car
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`relative w-full max-w-full max-h-[92vh] flex flex-col rounded-t-[36px] sm:rounded-t-[44px] bg-card border-t border-border shadow-2xl z-10 overflow-hidden transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        <div className="flex justify-center items-center pt-3.5 pb-1 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors" />
        </div>

        <div className="flex items-start justify-between px-6 sm:px-12 py-4 border-b border-border/60 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="w-6 h-6 text-primary" />
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Station Filter & Search
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Filter stations by your vehicle, wash type, distance, amenities, and ratings.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close Filter Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 text-foreground">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            <div className="space-y-8 pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-border/60 pb-8 lg:pb-0">
              {isAuthenticated && vehicles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      MY REGISTERED VEHICLES
                    </h3>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Select vehicle to check exact station rates
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          selectedVehicleId: undefined,
                          vehicleClassId: undefined,
                        }))
                      }
                      className={`px-4 py-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                        !draftFilters.selectedVehicleId
                          ? "bg-primary/10 border-primary text-primary shadow-sm"
                          : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      No Specific Vehicle
                    </button>

                    {vehicles.map((v) => {
                      const isSelected = draftFilters.selectedVehicleId === v.id
                      return (
                        <button
                          key={v.id}
                          onClick={() =>
                            setDraftFilters((prev) => ({
                              ...prev,
                              selectedVehicleId: v.id,
                              vehicleClassId: v.classId,
                              vehicleCategory: v.categoryId,
                            }))
                          }
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                              : "bg-muted/50 border-border text-foreground hover:bg-muted"
                          }`}
                        >
                          <Car className="w-3.5 h-3.5 shrink-0" />
                          <span>{v.nickname || `${v.brand} ${v.model}`}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  SORT BY
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {SORT_OPTIONS.map((opt) => {
                    const isActive = draftFilters.sortBy === opt.id
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setDraftFilters((prev) => ({ ...prev, sortBy: opt.id }))}
                        className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                            : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                    VEHICLE CATEGORY
                  </h3>
                  {loadingMetadata && (
                    <span className="text-[11px] text-muted-foreground animate-pulse">
                      Loading data...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        vehicleCategory: "all",
                        vehicleClassId: undefined,
                      }))
                    }
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                      draftFilters.vehicleCategory === "all"
                        ? "bg-primary/10 border-primary text-primary font-semibold shadow-sm"
                        : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Car className="w-4 h-4 shrink-0" />
                    <span>All Vehicles</span>
                  </button>

                  {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat.name, cat.slug)
                    const isActive =
                      draftFilters.vehicleCategory === cat.id ||
                      draftFilters.vehicleCategory === cat.name
                    return (
                      <button
                        key={cat.id}
                        onClick={() =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            vehicleCategory: cat.id,
                            vehicleClassId: undefined,
                          }))
                        }
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                          isActive
                            ? "bg-primary/10 border-primary text-primary font-semibold shadow-sm"
                            : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{cat.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {filterMetadata?.vehicleClasses && filterMetadata.vehicleClasses.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                    SPECIFIC VEHICLE CLASS
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <button
                      onClick={() =>
                        setDraftFilters((prev) => ({ ...prev, vehicleClassId: undefined }))
                      }
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                        !draftFilters.vehicleClassId
                          ? "bg-primary/10 border-primary text-primary font-semibold shadow-sm"
                          : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>Any Class</span>
                    </button>
                    {filterMetadata.vehicleClasses
                      .filter((c) =>
                        draftFilters.vehicleCategory === "all"
                          ? true
                          : c.categoryId === draftFilters.vehicleCategory
                      )
                      .map((cls) => {
                        const isSelected = draftFilters.vehicleClassId === cls.id
                        const ClassIcon = getCategoryIcon(cls.name)
                        return (
                          <button
                            key={cls.id}
                            onClick={() =>
                              setDraftFilters((prev) => ({ ...prev, vehicleClassId: cls.id }))
                            }
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                              isSelected
                                ? "bg-primary/10 border-primary text-primary font-semibold shadow-sm"
                                : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            <ClassIcon className="w-4 h-4 shrink-0" />
                            <span>{cls.name}</span>
                          </button>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                    DISTANCE FILTER
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">
                      Up to {draftFilters.maxDistanceKm}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">km</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={1}
                  max={50}
                  value={draftFilters.maxDistanceKm}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, maxDistanceKm: Number(e.target.value) }))
                  }
                  className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                />

                <div className="flex justify-between gap-2 overflow-x-auto pb-1">
                  {DISTANCE_PRESETS.map((km) => {
                    const isActive = draftFilters.maxDistanceKm === km
                    return (
                      <button
                        key={km}
                        onClick={() => setDraftFilters((prev) => ({ ...prev, maxDistanceKm: km }))}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none ${
                          isActive
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {km}km
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  MINIMUM RATING
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {RATING_OPTIONS.map((rate) => {
                    const isSelected = draftFilters.minRating === rate.value
                    return (
                      <button
                        key={rate.value}
                        onClick={() =>
                          setDraftFilters((prev) => ({ ...prev, minRating: rate.value }))
                        }
                        className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm transition-all cursor-pointer select-none ${
                          isSelected
                            ? "bg-primary/10 border-primary text-primary font-bold"
                            : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span>{rate.label}</span>
                        </div>

                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 sm:px-12 py-4 border-t border-border bg-card shrink-0 gap-4">
          <button
            onClick={handleReset}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Reset All
          </button>

          <button
            onClick={handleApply}
            className="flex items-center justify-center px-10 py-3.5 bg-primary hover:opacity-90 text-primary-foreground font-extrabold rounded-2xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-sm"
          >
            Apply Filters {activeCount > 0 && `(${activeCount})`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StationFilterModal
