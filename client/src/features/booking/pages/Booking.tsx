import { useEffect, useState, useMemo, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useStationStore } from "@/features/station/store/station.store"
import { vehicleApi } from "@/shared/apis/vehicle.api"
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
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>("SLOT_2")

  // Booking Submit State
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Fetch Station details & Catalog data on mount
  useEffect(() => {
    if (stationId) {
      fetchStationById(stationId)
    }
    if (categories.length === 0 || classes.length === 0) {
      loadCatalogData()
    }
  }, [stationId, fetchStationById, categories.length, classes.length, loadCatalogData])

  // Fetch User Vehicles from API
  const loadUserVehicles = useCallback(async () => {
    setIsVehiclesLoading(true)
    try {
      const data = await vehicleApi.getVehicles()
      setVehicles(data)
      // Auto-select primary or first vehicle if none selected yet
      if (data.length > 0 && !selectedVehicleId) {
        const primary = data.find((v) => v.isPrimary) || data[0]
        setSelectedVehicleId(primary.id)
      }
    } catch {
      // Ignore API errors gracefully
    } finally {
      setIsVehiclesLoading(false)
    }
  }, [selectedVehicleId])

  useEffect(() => {
    loadUserVehicles()
  }, [loadUserVehicles])

  // Selected Vehicle Object
  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || null,
    [vehicles, selectedVehicleId]
  )

  // Match Station Pricing based on Selected Vehicle's classId
  const matchingPricing = useMemo(() => {
    if (!selectedStation?.pricing || selectedStation.pricing.length === 0) return null
    if (selectedVehicle?.classId) {
      const found = selectedStation.pricing.find((p) => p.vehicleClassId === selectedVehicle.classId)
      if (found) return found
    }
    return selectedStation.pricing[0]
  }, [selectedStation?.pricing, selectedVehicle?.classId])

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

    return [
      { id: "VACUUM", name: "Interior Deep Vacuuming", price: 150 },
      { id: "POLISH", name: "Tire & Alloy Wheel Polish", price: 200 },
      { id: "ENGINE", name: "Engine Bay Degreasing", price: 250 },
    ]
  }, [selectedStation?.extraServices, selectedVehicle?.classId])

  // Available Time Slots
  const timeSlots: TimeSlotOption[] = useMemo(
    () => [
      { id: "SLOT_1", timeWindow: "09:00 - 10:00", label: "Morning Slot", status: "AVAILABLE" },
      {
        id: "SLOT_2",
        timeWindow: "10:00 - 11:00",
        label: "Selected Slot",
        status: "SELECTED",
      },
      { id: "SLOT_3", timeWindow: "11:00 - 12:00", label: "Fully Booked", status: "FULL" },
      {
        id: "SLOT_4",
        timeWindow: "13:00 - 14:00",
        label: "Limited Availability",
        status: "LIMITED",
        slotsLeft: 1,
      },
      {
        id: "SLOT_5",
        timeWindow: "14:00 - 15:00",
        label: "2 Slots Left",
        status: "LIMITED",
        slotsLeft: 2,
      },
      { id: "SLOT_6", timeWindow: "15:00 - 16:00", label: "Late Session", status: "AVAILABLE" },
    ],
    []
  )

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) || null,
    [plans, selectedPlanId]
  )

  const selectedExtras = useMemo(
    () => extraServices.filter((e) => selectedExtraIds.includes(e.id)),
    [extraServices, selectedExtraIds]
  )

  const selectedSlot = useMemo(
    () => timeSlots.find((s) => s.id === selectedSlotId) || null,
    [timeSlots, selectedSlotId]
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
    if (!canSubmit) return
    setIsSubmittingBooking(true)
    try {
      // Simulate real booking creation delay
      await new Promise((res) => setTimeout(res, 1200))
      setBookingSuccess(true)
    } catch (err) {
      console.error("Booking error:", err)
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

        <h1 className="text-base font-extrabold text-foreground tracking-tight">
          Slot Booking Checkout
        </h1>
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
            isLoading={isVehiclesLoading}
            categories={categories}
            classes={classes}
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
            slots={timeSlots}
            selectedSlotId={selectedSlotId}
            onSelectSlot={(id) => setSelectedSlotId(id)}
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