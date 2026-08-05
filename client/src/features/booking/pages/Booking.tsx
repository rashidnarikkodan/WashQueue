import { useEffect, useState, useMemo, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useStationStore } from "@/features/station/store/station.store"
import { stationApi } from "@/shared/apis/station.api"
import { vehicleApi } from "@/shared/apis/vehicle.api"
import { bookingApi } from "@/shared/apis/booking.api"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/catelog.store"
import type { Vehicle, CreateVehicleInput } from "@/features/vehicle/types"
import AddVehicleModal from "@/features/vehicle/components/AddVehicleModal"

import VehicleSelectionStep from "../components/VehicleSelectionStep"
import ServiceSelectionStep, {
  type ServicePlanOption,
  type ExtraServiceOption,
} from "../components/ServiceSelectionStep"
import TimeSlotSelectionStep, {
  type TimeSlotOption,
} from "../components/TimeSlotSelectionStep"
import BookingSummaryCard from "../components/BookingSummaryCard"

export default function Booking() {
  const [urlQuery] = useSearchParams()
  const navigate = useNavigate()
  const stationId = urlQuery.get("stationId")

  const { fetchStationById, selectedStation } = useStationStore()
  const { categories, classes, loadData: loadCatalogData } = useVehicleCatelogStore()

  // User Vehicles State
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(true)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false)
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)

  // Service Selection State
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>("HALF_WASH")
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([])

  // Date & Slot State
  const todayIso = new Date().toISOString().split("T")[0]
  const [selectedDate, setSelectedDate] = useState<string>(todayIso)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  // Real Calendar & Time Window API State
  const [bookingCalendar, setBookingCalendar] = useState<{
    minDate: string
    maxDate: string
    dates: { date: string; status: "AVAILABLE" | "FULL" | "HOLIDAY" | "CLOSED" }[]
  } | null>(null)
  const [serverWindows, setServerWindows] = useState<{
    windowId: string
    start: string
    end: string
    bookedCount: number
    remainingCapacity: number
    status: "OPEN" | "FULL" | "CLOSED" | "PAST"
  }[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Booking Submit State
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Fetch Booking Calendar from server
  useEffect(() => {
    if (!stationId) return
    stationApi
      .getBookingCalendar(stationId)
      .then((data) => {
        setBookingCalendar(data)
        if (data.dates.length > 0) {
          const currentValid = data.dates.find(
            (d) => d.date === selectedDate && d.status === "AVAILABLE"
          )
          if (!currentValid) {
            const firstAvailable = data.dates.find((d) => d.status === "AVAILABLE")
            if (firstAvailable) {
              setSelectedDate(firstAvailable.date)
            }
          }
        }
      })
      .catch(() => {})
  }, [stationId, selectedDate])

  // Fetch Available Time Windows for selectedDate
  useEffect(() => {
    if (!stationId || !selectedDate) return

    const fetchWindows = async () => {
      setIsLoadingSlots(true)
      try {
        const data = await stationApi.getAvailableTimeWindows(stationId, selectedDate)
        const windowsList = data.windows || []
        setServerWindows(windowsList)
        const available = windowsList.filter(
          (w) => w.status === "OPEN" && w.remainingCapacity > 0
        )
        if (available.length > 0) {
          setSelectedSlotId((prev) => {
            const exists = available.some((w) => w.windowId === prev)
            return exists ? prev : available[0].windowId
          })
        } else {
          setSelectedSlotId(null)
        }
      } catch {
        setServerWindows([])
        setSelectedSlotId(null)
      } finally {
        setIsLoadingSlots(false)
      }
    }

    void fetchWindows()
  }, [stationId, selectedDate])

  // Compute disabled dates array (dates that are NOT available)
  const disabledDates = useMemo(() => {
    if (!bookingCalendar?.dates) return []
    return bookingCalendar.dates
      .filter((d) => d.status !== "AVAILABLE")
      .map((d) => d.date)
  }, [bookingCalendar])

  // Transform server windows into TimeSlotOption items
  const timeSlotOptions: TimeSlotOption[] = useMemo(() => {
    if (serverWindows.length > 0) {
      return serverWindows.map((w) => {
        const startDateObj = new Date(w.start)
        const endDateObj = new Date(w.end)
        const formatTime = (d: Date) =>
          d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        const timeWindow = `${formatTime(startDateObj)} - ${formatTime(endDateObj)}`

        let label = `${w.remainingCapacity} slots left`
        let status: "AVAILABLE" | "SELECTED" | "LIMITED" | "FULL" = "AVAILABLE"

        if (w.status === "FULL" || w.remainingCapacity <= 0) {
          status = "FULL"
          label = "Fully Booked"
        } else if (w.remainingCapacity <= 2) {
          status = "LIMITED"
          label = `Only ${w.remainingCapacity} slot${w.remainingCapacity === 1 ? "" : "s"} left`
        }

        return {
          id: w.windowId,
          timeWindow,
          label,
          status,
          slotsLeft: w.remainingCapacity,
        }
      })
    }
    return []
  }, [serverWindows])

  // Fetch Station details & Catalog data on mount
  useEffect(() => {
    if (stationId) {
      fetchStationById(stationId)
    }
    if (categories.length === 0 || classes.length === 0) {
      loadCatalogData()
    }
  }, [stationId, fetchStationById, categories.length, classes.length, loadCatalogData])

  // Fetch User Vehicles from API — extracted so it can be re-called after adding a vehicle
  const loadUserVehicles = useCallback(async () => {
    setIsVehiclesLoading(true)
    try {
      const data = await vehicleApi.getVehicles()
      setVehicles(data)
    } catch {
      // Ignore API errors gracefully
    } finally {
      setIsVehiclesLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUserVehicles()
  }, [loadUserVehicles])

  // Station Supported Class IDs Set
  const stationClassIds = useMemo(() => {
    if (!selectedStation?.pricing || selectedStation.pricing.length === 0) return null
    return new Set(selectedStation.pricing.filter((p) => p.isActive !== false).map((p) => p.vehicleClassId))
  }, [selectedStation])

  // Available Vehicles matching station's supported classes (Wait for stationClassIds to avoid flash)
  const availableVehicles = useMemo(() => {
    if (!stationClassIds) return []
    return vehicles.filter((v) => v.classId && stationClassIds.has(v.classId))
  }, [vehicles, stationClassIds])

  // Combined Loading State to prevent dual rendering / UI flicker
  const isStep1Loading = isVehiclesLoading || (Boolean(stationId) && !selectedStation)

  // Keep selected vehicle ID synced to valid available vehicle
  useEffect(() => {
    queueMicrotask(() => {
      if (availableVehicles.length > 0) {
        const isCurrentValid = availableVehicles.some((v) => v.id === selectedVehicleId)
        if (!isCurrentValid) {
          const primary = availableVehicles.find((v) => v.isPrimary) || availableVehicles[0]
          setSelectedVehicleId(primary.id)
        }
      } else {
        setSelectedVehicleId(null)
      }
    })
  }, [availableVehicles, selectedVehicleId])

  // Selected Vehicle Object
  const selectedVehicle = useMemo(
    () => availableVehicles.find((v) => v.id === selectedVehicleId) || availableVehicles[0] || null,
    [availableVehicles, selectedVehicleId]
  )

  // Match Station Pricing based on Selected Vehicle's classId
  const matchingPricing = useMemo(() => {
    if (!selectedStation?.pricing || selectedStation.pricing.length === 0) return null
    if (selectedVehicle?.classId) {
      const found = selectedStation.pricing.find((p) => p.vehicleClassId === selectedVehicle.classId)
      if (found) return found
    }
    return selectedStation.pricing[0]
  }, [selectedStation, selectedVehicle])

  // Handle Add Vehicle Submission from Modal
  const handleAddVehicleSubmit = async (input: CreateVehicleInput): Promise<boolean> => {
    setIsAddingVehicle(true)
    try {
      const created = await vehicleApi.createVehicle(input)
      await loadUserVehicles()
      setSelectedVehicleId(created.id)
      setIsAddVehicleModalOpen(false)
      return true
    } catch (err) {
      console.error(err)
      return false
    } finally {
      setIsAddingVehicle(false)
    }
  }

  // Derive Service Plans from matched vehicle class pricing
  const plans: ServicePlanOption[] = useMemo(() => {
    const p = matchingPricing
    if (p) {
      return [
        {
          id: "HALF_WASH",
          name: "Express Half Wash",
          price: p.halfWashPrice,
          durationMins: 30,
          description:
            "Exterior foam wash, pressure rinse, wheel cleaning, and exterior window buffing.",
        },
        {
          id: "FULL_WASH",
          name: "Complete Full Wash",
          price: p.fullWashPrice,
          durationMins: 60,
          description:
            "Full body foam wash, interior vacuuming, dashboard wipe down, tire polish & underbody wash.",
        },
      ]
    }

    return []
  }, [matchingPricing])

  // Derive Extra Services dynamically based on vehicle classId
  const extraServices: ExtraServiceOption[] = useMemo(() => {
    if (selectedStation?.extraServices && selectedStation.extraServices.length > 0) {
      return selectedStation.extraServices.map((e) => {
        const classPricing = e.pricing?.find((p) => p.vehicleClassId === selectedVehicle?.classId)
        const price = classPricing ? classPricing.price : (e.pricing?.[0]?.price || 150)
        return {
          id: e.id,
          name: e.name,
          price,
          description: e.description,
        }
      })
    }
    return []
  }, [selectedStation, selectedVehicle])

  // Selected Slot Option Object
  const selectedSlot = useMemo(
    () => timeSlotOptions.find((s) => s.id === selectedSlotId) || null,
    [timeSlotOptions, selectedSlotId]
  )

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) || null,
    [plans, selectedPlanId]
  )

  const selectedExtras = useMemo(
    () => extraServices.filter((e) => selectedExtraIds.includes(e.id)),
    [extraServices, selectedExtraIds]
  )

  const formattedDate = useMemo(() => {
    if (!selectedDate) return ""
    const d = new Date(selectedDate)
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }, [selectedDate])

  const canSubmit = Boolean(selectedVehicleId && selectedPlanId && selectedSlotId)

  // Submit Booking Action
  const handleConfirmBooking = async () => {
    if (!canSubmit || !stationId || !selectedSlotId || !selectedVehicleId) return
    setIsSubmittingBooking(true)
    try {
      const serviceType = selectedPlanId === "full" ? "FULL" : "HALF"
      await bookingApi.createBooking({
        stationId,
        vehicleId: selectedVehicleId,
        timeWindowId: selectedSlotId,
        serviceType,
        extraServiceIds: selectedExtraIds,
        paymentType: "ONLINE_FULL",
      })
      setBookingSuccess(true)
    } catch (err) {
      console.error("Booking submission error:", err)
    } finally {
      setIsSubmittingBooking(false)
    }
  }

  return (
    <div className="pt-24 pb-20 min-h-screen text-left w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 text-foreground animate-in fade-in duration-300">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between py-4 mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Stations</span>
        </button>

       
      </div>

      {/* Main 12-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 8 Columns (Booking Steps Flow) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Step 1: Vehicle Selection */}
          <VehicleSelectionStep
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={(id) => setSelectedVehicleId(id)}
            onAddVehicle={() => setIsAddVehicleModalOpen(true)}
            isLoading={isStep1Loading}
            categories={categories}
            classes={classes}
            stationClassIds={stationClassIds}
          />

          <div className="w-full h-px bg-border" />

          {/* Step 2: Service Type */}
          <ServiceSelectionStep
            plans={plans}
            selectedPlanId={selectedPlanId}
            onSelectPlan={(id) => setSelectedPlanId(id)}
            extraServices={extraServices}
            selectedExtraIds={selectedExtraIds}
            onToggleExtra={(id) =>
              setSelectedExtraIds((prev) =>
                prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
              )
            }
          />

          <div className="w-full h-px bg-border" />

          {/* Step 3: Time Window of Bookings */}
          <TimeSlotSelectionStep
            selectedDate={selectedDate}
            onDateChange={(d) => setSelectedDate(d)}
            slots={timeSlotOptions}
            selectedSlotId={selectedSlotId}
            onSelectSlot={(id) => setSelectedSlotId(id)}
            minDate={bookingCalendar?.minDate}
            maxDate={bookingCalendar?.maxDate}
            disabledDates={disabledDates}
            calendarDates={bookingCalendar?.dates}
            isLoadingSlots={isLoadingSlots}
          />
        </div>

        {/* Right Column: 4 Columns (Booking Summary Card) */}
        <div className="lg:col-span-4 w-full">
          <BookingSummaryCard
            station={selectedStation?.station || null}
            selectedVehicle={selectedVehicle}
            selectedPlan={selectedPlan}
            selectedExtras={selectedExtras}
            selectedDateFormatted={formattedDate}
            selectedTimeWindow={selectedSlot?.timeWindow || null}
            onSubmit={handleConfirmBooking}
            isSubmitting={isSubmittingBooking}
            canSubmit={canSubmit}
          />
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        onSubmit={handleAddVehicleSubmit}
        isSubmitting={isAddingVehicle}
      />

      {/* Success Modal Notification */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-card border border-emerald-500/40 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200 text-card-foreground">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="text-2xl font-extrabold text-foreground">Booking Confirmed!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your washing slot for{" "}
              <strong className="text-foreground">{selectedVehicle?.nickname || "your vehicle"}</strong>{" "}
              at <strong className="text-foreground">{selectedStation?.station?.name || "the station"}</strong>{" "}
              has been successfully reserved for {formattedDate} ({selectedSlot?.timeWindow}).
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate("/bookings")}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 font-bold text-xs text-primary-foreground transition-all cursor-pointer shadow-md"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}