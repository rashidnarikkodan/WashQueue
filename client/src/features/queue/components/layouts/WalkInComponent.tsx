import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Car,
  Sparkles,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
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

  // Categories & Classes State
  const [categories, setCategories] = useState<VehicleCategory[]>([])
  const [classes, setClasses] = useState<VehicleClass[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true)
  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(false)

  // Time Windows / Slots State (today's live availability for this station)
  const [timeWindows, setTimeWindows] = useState<TimeWindowSlot[]>([])
  const [selectedTimeWindowId, setSelectedTimeWindowId] = useState<string>("")
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false)

  // Form State
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [category, setCategory] = useState("")
  const [vehicleClass, setVehicleClass] = useState("")
  const [serviceType, setServiceType] = useState<"HALF" | "FULL">("FULL")
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])

  // Customer Details State
  const [phone, setPhone] = useState("")
  const [fullName, setFullName] = useState("")
  const [isCustomerFound, setIsCustomerFound] = useState(false)
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false)

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdBooking, setCreatedBooking] = useState<BookingResponse | null>(null)

  // Fetch Categories on Mount
  useEffect(() => {
    let isMounted = true
    void Promise.resolve().then(async () => {
      if (!isMounted) return
      setIsLoadingCategories(true)
      try {
        const data = await vehicleCatelogApi.getCategories()
        if (!isMounted) return
        const active = (data ?? []).filter((c) => c.isActive)
        setCategories(active)
        if (active.length > 0) {
          setCategory(active[0].id)
        }
      } catch (err) {
        console.error("Failed to load vehicle categories:", err)
      } finally {
        if (isMounted) setIsLoadingCategories(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  // Fetch Classes whenever Category Changes
  const fetchClassesForCategory = useCallback(async (catId: string) => {
    if (!catId) {
      setClasses([])
      setVehicleClass("")
      return
    }
    setIsLoadingClasses(true)
    try {
      const data = await vehicleCatelogApi.getClasses({ categoryId: catId })
      const active = (data ?? []).filter((c) => c.isActive)
      setClasses(active)
      if (active.length > 0) {
        setVehicleClass(active[0].id)
      } else {
        setVehicleClass("")
      }
    } catch (err) {
      console.error("Failed to load classes for category:", err)
      setClasses([])
      setVehicleClass("")
    } finally {
      setIsLoadingClasses(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    if (category) {
      void Promise.resolve().then(async () => {
        if (ignore) return
        await fetchClassesForCategory(category)
      })
    }
    return () => {
      ignore = true
    }
  }, [category, fetchClassesForCategory])

  // Handle Category Selection Change
  const handleCategoryChange = (newCategoryId: string) => {
    setCategory(newCategoryId)
  }

  // Fetch Station & Station Details & Today's Time Windows
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

          if (windowsList.length > 0) {
            const nowMs = Date.now()
            const activeWin = windowsList.find(
              (w) =>
                w.status === "OPEN" &&
                new Date(w.start).getTime() <= nowMs &&
                new Date(w.end).getTime() > nowMs
            )
            const firstOpen = windowsList.find((w) => w.status === "OPEN")
            setSelectedTimeWindowId((activeWin || firstOpen || windowsList[0]).windowId)
          }
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

  // Customer Lookup Search
  const handleCustomerSearch = () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }

    setIsSearchingCustomer(true)
    setTimeout(() => {
      setIsSearchingCustomer(false)
      setIsCustomerFound(true)
      setFullName("John Doe")
      toast.success("Existing Customer Profile Found!")
    }, 600)
  }

  // Toggle Extra Services
  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Dynamic Price Calculations based on selected Vehicle Class and Station Detail
  const classPricing = stationDetail?.pricing?.find((p) => p.vehicleClassId === vehicleClass)
  const halfWashPrice = classPricing?.halfWashPrice ?? 250
  const fullWashPrice = classPricing?.fullWashPrice ?? 450
  const basePrice = serviceType === "HALF" ? halfWashPrice : fullWashPrice

  const availableExtras = stationDetail?.extraServices?.length
    ? stationDetail.extraServices.map((ex) => {
        const p = ex.pricing?.find((pr) => pr.vehicleClassId === vehicleClass)
        return {
          id: ex.id,
          label: ex.name,
          price: p ? p.price : 150,
        }
      })
    : [
        { id: "interior-cleaning", label: "Interior Cleaning", price: 150 },
        { id: "wax-polish", label: "Wax Polish", price: 200 },
        { id: "tire-shine", label: "Tire Shine", price: 50 },
        { id: "engine-cleaning", label: "Engine Cleaning", price: 300 },
      ]

  const extrasTotal = selectedExtras.reduce((sum, exId) => {
    const item = availableExtras.find((e) => e.id === exId)
    return sum + (item ? item.price : 0)
  }, 0)
  const grandTotal = basePrice + extrasTotal

  // Time Window / Live Availability Helpers
  const selectedSlot = timeWindows.find((w) => w.windowId === selectedTimeWindowId) || timeWindows[0]
  const formatSlotTime = (w?: TimeWindowSlot) => {
    if (!w) return "Auto-Assigned"
    const start = new Date(w.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const end = new Date(w.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    return `${start} - ${end}`
  }
  const nextWindow = useMemo(() => {
    const currentNow = new Date().getTime()
    return timeWindows.find(
      (w) => w.status === "OPEN" && w.windowId !== selectedSlot?.windowId && new Date(w.start).getTime() > currentNow
    )
  }, [timeWindows, selectedSlot])
  const slotCapacity = selectedSlot ? selectedSlot.bookedCount + selectedSlot.remainingCapacity : 0

  // Submit Walk-In Booking
  const handleCreateWalkIn = async () => {
    if (!stationInfo?.stationId) {
      toast.error("No active station assigned.")
      return
    }
    if (!registrationNumber.trim()) {
      toast.error("Please enter a vehicle registration number.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await bookingApi.createWalkIn({
        stationId: stationInfo.stationId,
        timeWindowId: selectedTimeWindowId || undefined,
        serviceType,
        walkInVehicle: {
          registrationNumber: registrationNumber.trim().toUpperCase(),
          categoryId: category,
          classId: vehicleClass,
        },
        walkInCustomer: fullName.trim()
          ? { name: fullName.trim(), phone: phone.trim() }
          : undefined,
        extraServiceIds: selectedExtras,
      })

      toast.success(`✓ Walk-In Booking Created! (${res.bookingNumber}) Navigating to Pre-Service Inspection...`)
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
                  className="w-full px-5 py-3.5 rounded-2xl bg-muted border border-border text-foreground font-mono text-base font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={isLoadingCategories}
                  className="w-full px-5 py-3.5 rounded-2xl bg-muted border border-border text-foreground font-medium text-base focus:outline-none focus:border-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoadingCategories ? (
                    <option value="">Loading categories...</option>
                  ) : categories.length === 0 ? (
                    <option value="">No categories found</option>
                  ) : (
                    categories.map((cat) => (
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
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                <span>CLASS</span>
                {isLoadingClasses && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-primary normal-case">
                    <Loader2 className="h-3 w-3 animate-spin" /> Updating classes...
                  </span>
                )}
              </label>

              {isLoadingClasses ? (
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Loading vehicle classes...</span>
                </div>
              ) : classes.length === 0 ? (
                <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
                  No vehicle classes available for this category.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {classes.map((cls) => (
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

              {/* Add-On Extras */}
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
                              isChecked ? "bg-primary border-primary text-primary-foreground" : "border-border"
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-medium text-foreground">{ex.label}</span>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">+₹{ex.price}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Customer Details (Optional) */}
          <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-6 text-card-foreground shadow-md">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground">Customer Details (Optional)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    PHONE NUMBER
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="flex-1 px-4 py-3.5 rounded-2xl bg-muted border border-border text-foreground font-medium text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleCustomerSearch}
                      disabled={isSearchingCustomer}
                      className="px-5 py-3.5 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-sm transition-colors border border-border cursor-pointer"
                    >
                      {isSearchingCustomer ? "..." : "Search"}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3.5 rounded-2xl bg-muted border border-border text-foreground font-medium text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Found Customer Card */}
              {isCustomerFound && (
                <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-500">Customer Found</span>
                      <h4 className="text-base font-bold text-foreground">{fullName}</h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-around pt-2 border-t border-emerald-500/20 text-center">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Visits</span>
                      <p className="text-lg font-bold text-foreground">12</p>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Last Visit</span>
                      <p className="text-lg font-bold text-foreground">4d ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (30% width / 4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Live Queue Availability & Time Slot Picker */}
          <div className="rounded-3xl bg-card border border-border overflow-hidden space-y-6 text-card-foreground shadow-md">
            <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                <Clock className="h-4 w-4" /> LIVE QUEUE AVAILABILITY
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                  selectedSlot?.status === "FULL"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-emerald-500 text-slate-950"
                }`}
              >
                {selectedSlot?.status === "FULL" ? "FULL" : timeWindows.length > 0 ? "AVAILABLE" : "AUTO"}
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  {timeWindows.length > 0 ? "CHOOSE SLOT WINDOW" : "CURRENT WINDOW"}
                </span>

                {isLoadingSlots ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading today's slots...
                  </div>
                ) : timeWindows.length > 0 ? (
                  <select
                    value={selectedTimeWindowId}
                    onChange={(e) => setSelectedTimeWindowId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-muted border border-border text-foreground font-bold text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    {timeWindows.map((w) => (
                      <option key={w.windowId} value={w.windowId} disabled={w.status !== "OPEN"}>
                        {formatSlotTime(w)} {w.status !== "OPEN" ? `(${w.status})` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <h3 className="text-xl font-black text-foreground">
                    Vehicle will be auto-assigned to the current window
                  </h3>
                )}
              </div>

              {selectedSlot && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">QUEUE LENGTH</span>
                    <p className="text-xl font-bold text-foreground">{selectedSlot.bookedCount}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">CAPACITY</span>
                    <p className="text-xl font-bold text-emerald-500">{slotCapacity} Slots</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">REMAINING</span>
                    <p className="text-xl font-bold text-primary">{selectedSlot.remainingCapacity} Open</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">STATUS</span>
                    <p className="text-xl font-bold text-foreground">{selectedSlot.status}</p>
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
