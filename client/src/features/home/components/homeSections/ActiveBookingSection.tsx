import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Sparkles, Calendar, MapPin, Car, Loader2, Clock } from "lucide-react"
import { bookingApi, type BookingResponse } from "@/shared/apis/booking.api"
import { stationApi } from "@/shared/apis/station.api"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { BookingStatusTracker } from "@/features/booking/components"

export default function ActiveBookingSection() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [activeBooking, setActiveBooking] = useState<BookingResponse | null>(null)
  const [queueInfo, setQueueInfo] = useState<{
    queuePosition?: number
    estimatedWait?: string
    bayInfo?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let ignore = false

    const fetchActiveBooking = async () => {
      if (!isAuthenticated) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await bookingApi.getUserBookings({ mine: true, limit: 10 })
        if (ignore) return

        const bookings = response.bookings || []
        const activeStatuses = [
          "IN_SERVICE",
          "CHECKED_IN",
          "SERVICE_COMPLETED",
          "AWAITING_HANDOVER",
          "CONFIRMED",
        ]

        const activeList = bookings.filter((b) => activeStatuses.includes(b.status))

        // Sort to get the most urgently active booking first
        const priorityOrder: Record<string, number> = {
          IN_SERVICE: 1,
          CHECKED_IN: 2,
          SERVICE_COMPLETED: 3,
          AWAITING_HANDOVER: 4,
          CONFIRMED: 5,
        }

        activeList.sort((a, b) => (priorityOrder[a.status] || 99) - (priorityOrder[b.status] || 99))

        const primary = activeList[0] || null
        setActiveBooking(primary)

        if (primary && primary.stationId) {
          try {
            const queueData = await stationApi.getPublicLiveQueue(primary.stationId)
            if (ignore) return

            const inWaiting = queueData.waitingQueue?.find((item) => item.id === primary.id)
            const inActive = queueData.activeServices?.find((item) => item.id === primary.id)

            if (inActive) {
              setQueueInfo({
                bayInfo: `Bay ${inActive.bayNumber || 1}`,
                estimatedWait: "In service",
              })
            } else if (inWaiting) {
              setQueueInfo({
                queuePosition: inWaiting.position,
                estimatedWait: inWaiting.estimatedWaitMinutes
                  ? `${inWaiting.estimatedWaitMinutes} mins`
                  : undefined,
              })
            }
          } catch {
            // Non-blocking queue info fallback
          }
        }
      } catch (err) {
        console.error("Failed to load active booking", err)
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    fetchActiveBooking()

    return () => {
      ignore = true
    }
  }, [isAuthenticated])

  if (isLoading) {
    return (
      <div className="lg:col-span-8 bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col justify-center items-center shadow-2xl relative overflow-hidden min-h-[412px] animate-pulse">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-semibold text-muted-foreground">Checking live queue status...</p>
      </div>
    )
  }

  if (!activeBooking) {
    return (
      <div className="lg:col-span-8 bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden backdrop-blur-md min-h-[412px] animate-in slide-in-from-left duration-500 text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready For Service</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">
            No Active Wash in Queue
          </h2>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Your garage is clear today! Select a station near you, pick a convenient time slot, and
            enjoy priority bay access with real-time progress updates.
          </p>
        </div>

        <div className="pt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigate("/stations")}
            className="flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-primary/15 cursor-pointer"
          >
            <span>Book a Wash</span>
            <ArrowRight className="h-4.5 w-4.5 stroke-[2.5]" />
          </button>

          {isAuthenticated && (
            <button
              onClick={() => navigate("/bookings")}
              className="flex items-center gap-2 px-5 py-4 rounded-2xl border border-border hover:bg-muted text-foreground font-extrabold text-sm transition-all cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Past Bookings</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // Calculate dynamic steps for active booking
  const status = activeBooking.status
  const isReady = ["AWAITING_HANDOVER", "COMPLETED"].includes(status)

  const vehicleName = activeBooking.vehicleDetails
    ? `${activeBooking.vehicleDetails.brand || ""} ${activeBooking.vehicleDetails.model || ""}`.trim() ||
      activeBooking.vehicleDetails.registrationNumber ||
      "Vehicle"
    : activeBooking.walkInVehicle?.registrationNumber || "Your Vehicle"

  const stationName = activeBooking.stationDetails?.name || "Wash Station"

  const displayBookingId = activeBooking.bookingNumber
    ? `#${activeBooking.bookingNumber}`
    : `#WQ-${activeBooking.id.slice(-6).toUpperCase()}`

  let statusBadgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20"
  let statusBadgeText = `STATUS: ${status.replace(/_/g, " ")}`

  if (status === "IN_SERVICE") {
    statusBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse"
    statusBadgeText = "LIVE STATUS: IN SERVICE"
  } else if (status === "CHECKED_IN") {
    statusBadgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
    statusBadgeText = "LIVE STATUS: QUEUED"
  } else if (isReady) {
    statusBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    statusBadgeText = "READY FOR PICKUP"
  }

  let headlineText = `Booking ${displayBookingId}`
  if (status === "IN_SERVICE") {
    headlineText = queueInfo?.bayInfo ? `Washing in ${queueInfo.bayInfo}` : "Washing in Bay"
  } else if (status === "CHECKED_IN") {
    headlineText = queueInfo?.queuePosition
      ? `Queue Position #${String(queueInfo.queuePosition).padStart(2, "0")}`
      : "Vehicle in Queue"
  } else if (isReady) {
    headlineText = "Vehicle Ready for Handover"
  } else if (status === "CONFIRMED") {
    headlineText = "Upcoming Wash Confirmed"
  }

  const slotTime = activeBooking.scheduling?.windowStart
    ? new Date(activeBooking.scheduling.windowStart).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Scheduled"

  return (
    <div className="lg:col-span-8 bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden backdrop-blur-md min-h-[412px] animate-in slide-in-from-left duration-500">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 text-left">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${statusBadgeColor}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {statusBadgeText}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              Booking ID: {displayBookingId}
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">
            {headlineText}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5 text-foreground font-semibold">
              <Car className="h-4 w-4 text-primary" />
              {vehicleName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {stationName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Slot: {slotTime}
            </span>
          </div>

          <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
            {status === "IN_SERVICE" ? (
              <>
                Your vehicle is actively being detailed. Estimated completion in approx.{" "}
                <span className="text-primary font-bold">
                  {activeBooking.estimatedServiceDurationMinutes || 15} mins
                </span>
                .
              </>
            ) : status === "CHECKED_IN" ? (
              <>
                Estimated wait time:{" "}
                <span className="text-[#ADC6FF] font-bold">
                  {queueInfo?.estimatedWait || "Under 15 minutes"}
                </span>
                . We will notify you as soon as the bay is clear.
              </>
            ) : isReady ? (
              <>
                Your vehicle wash is completed! Please proceed to the handover bay for inspection
                and pick-up.
              </>
            ) : (
              <>
                Service confirmed for{" "}
                <span className="font-bold text-foreground">
                  {activeBooking.serviceType === "FULL" ? "Full Wash" : "Express Wash"}
                </span>
                . Arrive 5 minutes before your slot for instant check-in.
              </>
            )}
          </p>
        </div>

        <button
          onClick={() => navigate(`/bookings/${activeBooking.id}`)}
          className="flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-primary/10 cursor-pointer self-start shrink-0"
        >
          <span>Track Booking</span>
          <ArrowRight className="h-4.5 w-4.5 stroke-[2.5]" />
        </button>
      </div>

      <div className="pt-6">
        <BookingStatusTracker booking={activeBooking} />
      </div>
    </div>
  )
}
