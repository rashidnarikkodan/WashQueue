import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Car,
  Sparkles,
  CheckCircle2,
  Clock,
  Printer,
  Check,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { managerApi } from "@/shared/apis/manager.api"
import { bookingApi } from "@/shared/apis/booking.api"
import { vehicleCatelogApi, stationApi } from "@/shared/apis"
import type { BookingResponse } from "@/shared/apis/booking.api"
import type { VehicleCategory, VehicleClass } from "@/features/vehicle-catelog/types"
import type { StationDetail } from "@/features/station/types"
import type { Window as TimeWindowSlot } from "@/features/booking/types/booking.types"

export default function WalkInComponent() {
  const navigate = useNavigate()
  const [stationInfo, setStationInfo] = useState<{
    stationId: string
    stationName: string
  } | null>(null)
  const [stationDetail, setStationDetail] = useState<StationDetail | null>(null)

  // Catalog State
  const [allCategories, setAllCategories] = useState<VehicleCategory[]>([])
  const [allClasses, setAllClasses] = useState<VehicleClass[]>([])
  const [isLoadingCatelog, setIsLoadingCatelog] = useState<boolean>(true)

  // Time Windows State (today's live availability for this station)
  const [timeWindows, setTimeWindows] = useState<TimeWindowSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false)

  // Form State
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [category, setCategory] = useState("")
  const [vehicleClass, setVehicleClass] = useState("")
  const [serviceType, setServiceType] = useState<"HALF" | "FULL">("FULL")
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])

  // Customer Details State (Simple 2 inputs)
  const [phone, setPhone] = useState("")
  const [fullName, setFullName] = useState("")

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdBooking, setCreatedBooking] = useState<BookingResponse | null>(null)

  // 1. Fetch Categories & Classes on Mount
  useEffect(() => {
    let isMounted = true
    void Promise.resolve().then(async () => {
      setIsLoadingCatelog(true)
      try {
        const [catsData, classesData] = await Promise.all([
          vehicleCatelogApi.getCategories(),
          vehicleCatelogApi.getClasses(),
        ])
        if (!isMounted) return
        setAllCategories((catsData ?? []).filter((c) => c.isActive !== false))
        setAllClasses((classesData ?? []).filter((c) => c.isActive !== false))
      } catch (err) {
        console.error("Failed to load vehicle catalog:", err)
      } finally {
        if (isMounted) setIsLoadingCatelog(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  // 2. Fetch Station & Details & Today's Slots
  const fetchStation = useCallback(async () => {
    try {
      const stations = await managerApi.getManagedStations()
      if (stations && stations.length > 0) {
        const sId = stations[0].stationId
        setStationInfo({
          stationId: sId,
          stationName: stations[0].stationName,
        })
        try {
          const detail = await stationApi.getStationById(sId)
          setStationDetail(detail)
        } catch (e) {
          console.error("Failed to load station pricing details:", e)
        }

        try {
          setIsLoadingSlots(true)
          const todayStr = new Date().toISOString().split("T")[0]
          const slotsData = await stationApi.getAvailableTimeWindows(sId, todayStr)
          const windowsList = slotsData?.windows || []
          setTimeWindows(windowsList)
        } catch (e) {
          console.error("Failed to load time windows:", e)
        } finally {
          setIsLoadingSlots(false)
        }
      }
    } catch (err) {
      console.error("Failed to load station:", err)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchStation()
    })
    return () => {
      ignore = true
    }
  }, [fetchStation])

  // 3. Station Supported Classes & Categories Filtering
  const stationSupportedClassIds = useMemo(() => {
    if (!stationDetail?.pricing) return new Set<string>()
    return new Set(
      stationDetail.pricing
        .filter(
          (p) =>
            p.isActive !== false &&
            ((p.halfWashPrice && p.halfWashPrice > 0) || (p.fullWashPrice && p.fullWashPrice > 0))
        )
        .map((p) => p.vehicleClassId)
    )
  }, [stationDetail])

  // Show only categories that have at least one active vehicle class supported at this station
  const availableCategories = useMemo(() => {
    if (stationSupportedClassIds.size === 0) return []
    return allCategories.filter((cat) =>
      allClasses.some(
        (cls) =>
          cls.categoryId === cat.id &&
          cls.isActive !== false &&
          stationSupportedClassIds.has(cls.id)
      )
    )
  }, [allCategories, allClasses, stationSupportedClassIds])

  // Show only classes for the selected category that are supported at this station
  const availableClasses = useMemo(() => {
    if (!category || stationSupportedClassIds.size === 0) return []
    return allClasses.filter(
      (cls) =>
        cls.isActive !== false &&
        cls.categoryId === category &&
        stationSupportedClassIds.has(cls.id)
    )
  }, [category, allClasses, stationSupportedClassIds])

  // Auto-sync category selection
  useEffect(() => {
    if (availableCategories.length > 0) {
      if (!category || !availableCategories.some((c) => c.id === category)) {
        setCategory(availableCategories[0].id)
      }
    } else {
      setCategory("")
    }
  }, [availableCategories, category])

  // Auto-sync vehicle class selection
  useEffect(() => {
    if (availableClasses.length > 0) {
      if (!vehicleClass || !availableClasses.some((c) => c.id === vehicleClass)) {
        setVehicleClass(availableClasses[0].id)
      }
    } else {
      setVehicleClass("")
    }
  }, [availableClasses, vehicleClass])

  // 4. Extra Services Available for this Station
  const availableExtras = useMemo(() => {
    if (!stationDetail?.extraServices || stationDetail.extraServices.length === 0) {
      return []
    }
    return stationDetail.extraServices
      .filter((ex) => ex.isActive !== false)
      .map((ex) => {
        const p = ex.pricing?.find((pr) => pr.vehicleClassId === vehicleClass)
        return {
          id: ex.id,
          label: ex.name,
          description: ex.description,
          price: p ? p.price : 0,
        }
      })
  }, [stationDetail, vehicleClass])

  // Clean up selected extras if vehicle class or available extras change
  useEffect(() => {
    const validExtraIds = new Set(availableExtras.map((e) => e.id))
    setSelectedExtras((prev) => prev.filter((id) => validExtraIds.has(id)))
  }, [availableExtras])

  // Toggle Extra Services
  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // 5. Pricing Calculations
  const classPricing = stationDetail?.pricing?.find(
    (p) => p.vehicleClassId === vehicleClass && p.isActive !== false
  )
  const halfWashPrice = classPricing?.halfWashPrice ?? 0
  const fullWashPrice = classPricing?.fullWashPrice ?? 0
  const basePrice = serviceType === "HALF" ? halfWashPrice : fullWashPrice

  const extrasTotal = selectedExtras.reduce((sum, exId) => {
    const item = availableExtras.find((e) => e.id === exId)
    return sum + (item ? item.price : 0)
  }, 0)
  const grandTotal = basePrice + extrasTotal

  // 6. Slot Window Calculation (Fixed current time window, non-selectable)
  const currentSlot = useMemo(() => {
    if (timeWindows.length === 0) return null
    const nowMs = Date.now()
    // Find window that contains the current time
    const activeWin = timeWindows.find(
      (w) => new Date(w.start).getTime() <= nowMs && new Date(w.end).getTime() > nowMs
    )
    if (activeWin) return activeWin

    // If current time is not inside any window, find next upcoming open window, or fallback to first
    const upcoming = timeWindows.find(
      (w) => w.status === "OPEN" && new Date(w.start).getTime() > nowMs
    )
    return upcoming || timeWindows.find((w) => w.status === "OPEN") || timeWindows[0]
  }, [timeWindows])

  const formatSlotTime = (w?: TimeWindowSlot | null) => {
    if (!w) return "Current Window"
    const start = new Date(w.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const end = new Date(w.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    return `${start} - ${end}`
  }

  const nextWindow = useMemo(() => {
    if (!currentSlot) return null
    const currentNow = Date.now()
    return timeWindows.find(
      (w) =>
        w.status === "OPEN" &&
        w.windowId !== currentSlot.windowId &&
        new Date(w.start).getTime() > currentNow
    )
  }, [timeWindows, currentSlot])

  const slotCapacity = currentSlot
    ? currentSlot.bookedCount + currentSlot.remainingCapacity
    : 0

  // 7. Submit Walk-In Booking
  const handleCreateWalkIn = async () => {
    if (!stationInfo?.stationId) {
      toast.error("No active station assigned.")
      return
    }
    if (!registrationNumber.trim()) {
      toast.error("Please enter a vehicle registration number.")
      return
    }
    if (!category || !vehicleClass) {
      toast.error("Please select a vehicle category and class.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await bookingApi.createWalkIn({
        stationId: stationInfo.stationId,
        timeWindowId: currentSlot?.windowId || undefined,
        serviceType,
        walkInVehicle: {
          registrationNumber: registrationNumber.trim().toUpperCase(),
          categoryId: category,
          classId: vehicleClass,
        },
        walkInCustomer:
          fullName.trim() || phone.trim()
            ? {
                name: fullName.trim() || "Walk-In Customer",
                phone: phone.trim(),
              }
            : undefined,
        extraServiceIds: selectedExtras,
      })

      toast.success(
        `✓ Walk-In Booking Created! (${res.bookingNumber}) Navigating to Pre-Service Inspection...`
      )
      setCreatedBooking(res)
      navigate(`/manager/bookings/${res.id}/pre-inspection`)
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      console.error("Failed to create walk-in booking:", err)
      toast.error(errorObj?.message || "Failed to create walk-in booking.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (70% width / 8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Vehicle Details */}
          <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-6 text-card-foreground shadow-md">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Car className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Vehicle Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  REGISTRATION NUMBER
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. MH 12 AB 1234"
                  className="w-full uppercase px-5 py-3.5 rounded-2xl bg-muted border border-border text-foreground font-mono text-base font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isLoadingCatelog}
                  className="w-full px-5 py-3.5 rounded-2xl bg-muted border border-border text-foreground font-medium text-base focus:outline-none focus:border-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoadingCatelog ? (
                    <option value="">Loading categories...</option>
                  ) : availableCategories.length === 0 ? (
                    <option value="">No categories available for this station</option>
                  ) : (
                    availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Vehicle Class Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                CLASS
              </label>

              {isLoadingCatelog ? (
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Loading vehicle classes...</span>
                </div>
              ) : availableClasses.length === 0 ? (
                <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
                  No vehicle classes available for this station in the selected category.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableClasses.map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setVehicleClass(cls.id)}
                      className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all cursor-pointer border ${
                        vehicleClass === cls.id
                          ? "bg-primary/10 text-primary border-primary/80 shadow-md shadow-primary/10"
                          : "bg-muted text-muted-foreground border-border hover:border-border/80"
                      }`}
                    >
                      {cls.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Service Details */}
          <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-6 text-card-foreground shadow-md">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Service Details</h2>
            </div>

            <div
              className={`grid grid-cols-1 ${
                availableExtras.length > 0 ? "sm:grid-cols-2" : ""
              } gap-6`}
            >
              {/* Wash Type */}
              <div className="space-y-3">
                <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  WASH TYPE
                </span>

                <div className="space-y-3">
                  {[
                    { type: "HALF", name: "Half Wash", price: halfWashPrice },
                    { type: "FULL", name: "Full Wash", price: fullWashPrice },
                  ].map((w) => (
                    <div
                      key={w.type}
                      onClick={() => setServiceType(w.type as "HALF" | "FULL")}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        serviceType === w.type
                          ? "bg-card border-primary shadow-md shadow-primary/10"
                          : "bg-muted border-border hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                            serviceType === w.type
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-border bg-muted"
                          }`}
                        >
                          {serviceType === w.type && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span className="text-sm font-bold text-foreground">{w.name}</span>
                      </div>
                      <span className="text-sm font-extrabold text-primary">₹{w.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-On Extras - only rendered if available in this station */}
              {availableExtras.length > 0 && (
                <div className="space-y-3">
                  <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    ADD-ON EXTRAS
                  </span>

                  <div className="space-y-2.5">
                    {availableExtras.map((ex) => {
                      const isChecked = selectedExtras.includes(ex.id)
                      return (
                        <div
                          key={ex.id}
                          onClick={() => toggleExtra(ex.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isChecked
                              ? "bg-card border-primary/60"
                              : "bg-muted border-border hover:border-border/80"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-4 w-4 rounded border flex items-center justify-center ${
                                isChecked
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-border"
                              }`}
                            >
                              {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-medium text-foreground">{ex.label}</span>
                          </div>
                          <span className="text-xs font-bold text-muted-foreground">
                            +₹{ex.price}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Customer Details (Optional) - Two Simple Inputs */}
          <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-6 text-card-foreground shadow-md">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground">Customer Details (Optional)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-5 py-3.5 rounded-2xl bg-muted border border-border text-foreground font-medium text-base focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={15}
                  className="w-full px-5 py-3.5 rounded-2xl bg-muted border border-border text-foreground font-medium text-base focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (30% width / 4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Live Queue Availability & Fixed Current Time Window */}
          <div className="rounded-3xl bg-card border border-border overflow-hidden space-y-6 text-card-foreground shadow-md">
            <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                <Clock className="h-4 w-4" /> LIVE QUEUE AVAILABILITY
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                  currentSlot?.status === "FULL"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-emerald-500 text-slate-950"
                }`}
              >
                {currentSlot?.status === "FULL"
                  ? "FULL"
                  : timeWindows.length > 0
                  ? "AVAILABLE"
                  : "AUTO"}
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  CURRENT TIME WINDOW (FIXED)
                </span>

                {isLoadingSlots ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-3.5 rounded-2xl bg-muted border border-border">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading today&apos;s
                    slot window...
                  </div>
                ) : currentSlot ? (
                  <div className="p-4 rounded-2xl bg-muted/70 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-sm font-extrabold text-foreground block">
                          {formatSlotTime(currentSlot)}
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Auto-assigned for current arrival
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                        currentSlot.status === "FULL"
                          ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                          : currentSlot.status === "OPEN"
                          ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {currentSlot.status}
                    </span>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-muted/70 border border-border text-xs text-muted-foreground font-medium">
                    Vehicle will be auto-assigned to the current active window.
                  </div>
                )}
              </div>

              {currentSlot && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      QUEUE LENGTH
                    </span>
                    <p className="text-xl font-bold text-foreground">{currentSlot.bookedCount}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      CAPACITY
                    </span>
                    <p className="text-xl font-bold text-emerald-500">{slotCapacity} Slots</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      REMAINING
                    </span>
                    <p className="text-xl font-bold text-primary">
                      {currentSlot.remainingCapacity} Open
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      STATUS
                    </span>
                    <p className="text-xl font-bold text-foreground">{currentSlot.status}</p>
                  </div>
                </div>
              )}

              {nextWindow && (
                <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium">
                  <span>Next Window</span>
                  <span className="font-bold text-foreground">{formatSlotTime(nextWindow)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Booking Summary & Final Payment */}
          <div className="rounded-3xl bg-card border border-border p-6 space-y-6 text-card-foreground shadow-md">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-3">
              Booking Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{serviceType} Wash</span>
                <span className="font-bold text-foreground">₹{basePrice}</span>
              </div>

              {extrasTotal > 0 && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Add-on Extras</span>
                  <span className="font-bold text-foreground">₹{extrasTotal}</span>
                </div>
              )}

              <div className="pt-3 border-t border-border flex items-center justify-between text-base">
                <span className="font-extrabold text-foreground">Grand Total</span>
                <span className="font-black text-2xl text-primary">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={handleCreateWalkIn}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 font-extrabold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Printer className="h-4 w-4" />
              <span>{isSubmitting ? "Creating..." : "Create Walk-In & Print Ticket"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {createdBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-3xl w-full max-w-md p-6 space-y-6 text-center shadow-2xl animate-in zoom-in-95">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />

            <div>
              <h3 className="text-2xl font-bold text-foreground">Walk-In Booking Created</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Ticket #{createdBooking.bookingNumber} • Cash Paid: ₹{grandTotal}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setCreatedBooking(null)
                  navigate("/manager/queue")
                }}
                className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all cursor-pointer"
              >
                Go to Queue Board
              </button>

              <button
                onClick={() => {
                  setCreatedBooking(null)
                  setRegistrationNumber("")
                }}
                className="px-5 py-3.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-sm transition-colors border border-border cursor-pointer"
              >
                New Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
