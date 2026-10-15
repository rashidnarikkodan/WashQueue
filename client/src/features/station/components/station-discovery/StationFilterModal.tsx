import React, { useState, useEffect, useRef, useCallback } from "react"
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

  const getInitialHeight = () => {
    if (typeof window !== "undefined") {
      return Math.round(window.innerHeight * 0.85)
    }
    return 650
  }

  const [modalHeight, setModalHeight] = useState<number>(getInitialHeight)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartYRef = useRef<number>(0)
  const dragStartHeightRef = useRef<number>(0)
  const modalHeightRef = useRef<number>(modalHeight)

  useEffect(() => {
    modalHeightRef.current = modalHeight
  }, [modalHeight])

  // Drag handlers for both mobile (touch) and laptop (mouse)
  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true)
    dragStartYRef.current = clientY
    dragStartHeightRef.current = modalHeightRef.current
  }, [])

  const handleDragMove = useCallback((clientY: number) => {
    const deltaY = clientY - dragStartYRef.current
    const maxHeight = Math.round(window.innerHeight * 0.96)
    const newHeight = dragStartHeightRef.current - deltaY
    const clamped = Math.min(maxHeight, Math.max(100, newHeight))
    setModalHeight(clamped)
  }, [])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    const currentH = modalHeightRef.current
    const winH = window.innerHeight

    // Drag completely down / below 1/4 of screen (25% height) closes modal
    if (currentH < winH * 0.25) {
      onClose()
      return
    }

    // Dragged above 90% of screen snaps to 95vh
    if (currentH > winH * 0.9) {
      setModalHeight(Math.round(winH * 0.95))
      return
    }

    // Otherwise, keep the exact height adjusted as per user's intent
    setModalHeight(currentH)
  }, [onClose])

  useEffect(() => {
    if (!isDragging) return

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      handleDragMove(e.clientY)
    }

    const onMouseUp = () => {
      handleDragEnd()
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDragMove(e.touches[0].clientY)
      }
    }

    const onTouchEnd = () => {
      handleDragEnd()
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("touchend", onTouchEnd)
    window.addEventListener("touchcancel", onTouchEnd)

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setDraftFilters(currentFilters)
      setModalHeight(getInitialHeight())
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
        // Ignore metadata fetch errors; fall back to default filter options
      } finally {
        setLoadingMetadata(false)
      }
    }

    if (isOpen) {
      void Promise.resolve().then(async () => {
        await fetchMetadata()
        if (isAuthenticated && vehicles.length === 0) {
          await loadVehicles()
        }
      })
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
        style={{ height: `${modalHeight}px` }}
        className={`relative w-full max-w-full max-h-[96vh] min-h-[220px] flex flex-col rounded-t-[32px] sm:rounded-t-[44px] bg-card border-t border-border shadow-2xl z-10 overflow-hidden transform ${
          isDragging
            ? "transition-none select-none"
            : "transition-[height,transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        } ${isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
      >
        {/* Holdable & Draggable pill handle */}
        <div
          onMouseDown={(e) => {
            e.preventDefault()
            handleDragStart(e.clientY)
          }}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handleDragStart(e.touches[0].clientY)
            }
          }}
          className="flex justify-center items-center pt-3 pb-1.5 shrink-0 cursor-grab active:cursor-grabbing select-none touch-none w-full group"
          aria-label="Drag to resize or dismiss filter modal"
          title="Drag up or down to adjust modal height, drag completely down to close"
        >
          <div
            className={`rounded-full transition-all duration-150 ${
              isDragging
                ? "w-16 h-2 bg-primary shadow-xs scale-105"
                : "w-12 h-1.5 bg-muted-foreground/30 group-hover:bg-muted-foreground/60 group-hover:w-14"
            }`}
          />
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
