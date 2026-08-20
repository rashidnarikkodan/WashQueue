import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Calendar as CalendarIcon,
  Clock,
  Car,
  QrCode,
  ArrowRight,
  Play,
  Check,
  Building2,
  X,
  AlertTriangle,
  Sparkles,
  Droplets,
  Wrench,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { managerApi } from "@/shared/apis/manager.api"
import { bookingApi } from "@/shared/apis/booking.api"
import type { BookingResponse } from "@/shared/apis/booking.api"
import {
  getSocketClient,
  subscribeToStation,
  unsubscribeFromStation,
} from "@/shared/services/socket.client"

type QueueFilter = "ALL" | "WAITING" | "IN_SERVICE" | "AWAITING_HANDOVER" | "STALLED"

const isActiveQueueStatus = (status: string) => {
  return (
    status === "CHECK_IN" ||
    status === "CHECKED_IN" ||
    status === "IN_SERVICE" ||
    status === "SERVICE_COMPLETED" ||
    status === "AWAITING_HANDOVER" ||
    status === "AWAITING_CONFIRMATION" ||
    status === "STALLED"
  )
}

export default function ManagerQueuePage() {
  const navigate = useNavigate()
  const [stationInfo, setStationInfo] = useState<{
    stationId: string
    stationName: string
  } | null>(null)
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [filterType, setFilterType] = useState<QueueFilter>("ALL")
  
  // Exception handling state
  const [stallingBookingId, setStallingBookingId] = useState<string | null>(null)
  const [stallReasonInput, setStallReasonInput] = useState("")
  const [resolvingBookingId, setResolvingBookingId] = useState<string | null>(null)
  const [resolutionInput, setResolutionInput] = useState("")
  const [targetStatusInput, setTargetStatusInput] = useState<"CHECKED_IN" | "IN_SERVICE" | "CANCELLED">("CHECKED_IN")

  // Helper to resolve check-in arrival timestamp
  const getCheckInTime = useCallback((b: BookingResponse): number => {
    if (b.statusHistory && b.statusHistory.length > 0) {
      const checkInLog = b.statusHistory.find(
        (h) => h.toStatus === "CHECK_IN" || h.toStatus === "CHECKED_IN"
      )
      if (checkInLog) {
        return new Date(checkInLog.createdAt).getTime()
      }
    }
    return new Date(b.updatedAt || b.createdAt).getTime()
  }, [])

  const [liveQueueData, setLiveQueueData] = useState<{
    stationId: string
    stationName: string
    totalBays: number
    activeServicesCount: number
    availableBays: number
    queueDepth: number
    totalActiveAndWaiting: number
    averageWashDurationMinutes: number
    waitingQueue: Array<{
      bookingId: string
      bookingNumber: string
      queuePosition: number
      isBayActive: boolean
      assignedBayNumber?: number
      estimatedWaitMinutes: number
    }>
    activeServices: Array<{
      bookingId: string
      bookingNumber: string
      queuePosition: number
      isBayActive: boolean
      assignedBayNumber?: number
      estimatedWaitMinutes: number
    }>
  } | null>(null)

  // 1. Fetch Manager Station & Authoritative Live Queue
  // `silent` skips the isLoading toggle so real-time refreshes patch data in place
  // instead of blanking the list with the "Loading queue list..." state.
  const fetchStationAndQueue = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const stations = await managerApi.getManagedStations()
      if (stations && stations.length > 0) {
        const activeStation = stations[0]
        setStationInfo({
          stationId: activeStation.stationId,
          stationName: activeStation.stationName,
        })

        // Fetch authoritative server-computed operational queue
        try {
          const liveQ = await bookingApi.getLiveQueue(activeStation.stationId)
          setLiveQueueData(liveQ)
        } catch {
          // Ignore live queue fallback if not available
        }

        // Fetch bookings for this station
        const res = await bookingApi.getUserBookings({
          stationId: activeStation.stationId,
          limit: 100,
        })
        const allBookings = res.bookings || []
        
        // Filter strictly for ACTIVE operational queue items (NO COMPLETED / CANCELLED / NO_SHOW)
        const activeList = allBookings.filter((b: BookingResponse) => isActiveQueueStatus(b.status))
        setBookings(activeList)

        // Select the first in-service or checked-in booking
        setSelectedBookingId((prev) => {
          if (prev && activeList.some((b) => b.id === prev)) {
            return prev
          }
          if (activeList.length > 0) {
            const inService = activeList.find((b) => b.status === "IN_SERVICE")
            if (inService) return inService.id
            const sortedWaiting = [...activeList].sort(
              (a, b) => getCheckInTime(a) - getCheckInTime(b)
            )
            return sortedWaiting[0]?.id || null
          }
          return null
        })
      } else {
        toast.error("No active station assignment found for your manager account.")
      }
    } catch (err) {
      console.error("Failed to load queue data:", err)
      if (!silent) toast.error("Failed to load queue data")
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [getCheckInTime])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchStationAndQueue()
    })
    return () => {
      ignore = true
    }
  }, [fetchStationAndQueue])

  // Patch a single booking (and the live queue meta) in place from a real-time payload,
  // instead of refetching the whole station queue and blanking the UI.
  const applyRealtimeBookingUpdate = useCallback(
    async (bookingId?: string) => {
      if (!stationInfo?.stationId) return

      try {
        const liveQ = await bookingApi.getLiveQueue(stationInfo.stationId)
        setLiveQueueData(liveQ)
      } catch {
        // Ignore transient live-queue refresh failures; next event will retry
      }

      if (!bookingId) return

      try {
        const updated = await bookingApi.getBookingById(bookingId)
        setBookings((prev) => {
          const exists = prev.some((b) => b.id === updated.id)
          if (!isActiveQueueStatus(updated.status)) {
            return exists ? prev.filter((b) => b.id !== updated.id) : prev
          }
          return exists
            ? prev.map((b) => (b.id === updated.id ? updated : b))
            : [...prev, updated]
        })
      } catch (err) {
        console.error("Failed to sync booking from real-time event:", err)
      }
    },
    [stationInfo?.stationId]
  )

  // 2. Real-Time Socket.IO Subscriptions (Event-driven without polling interval)
  useEffect(() => {
    if (!stationInfo?.stationId) return

    subscribeToStation(stationInfo.stationId)
    const socket = getSocketClient()

    const handleRealTimeUpdate = (payload?: { bookingId?: string }) => {
      void applyRealtimeBookingUpdate(payload?.bookingId)
    }

    // Only a genuine reconnect (after a dropped connection) warrants a full silent resync;
    // routine events are patched in place above.
    const handleReconnect = () => {
      void fetchStationAndQueue(true)
    }

    const realTimeEvents = [
      "QUEUE_UPDATED",
      "QUEUE_POSITION_CHANGED",
      "CHECKIN_SUCCESS",
      "BOOKING_CHECKED_IN",
      "WASH_STARTED",
      "SERVICE_STARTED",
      "WASH_COMPLETED",
      "SERVICE_COMPLETED",
      "POST_INSPECTION_COMPLETED",
      "HANDOVER_READY",
      "BOOKING_COMPLETED",
      "BOOKING_CREATED",
      "BOOKING_CANCELLED",
      "BOOKING_NO_SHOW",
      "BOOKING_STALLED",
      "REFUND_COMPLETED",
    ]

    realTimeEvents.forEach((evt) => socket.on(evt, handleRealTimeUpdate))
    socket.on("reconnect", handleReconnect)

    return () => {
      realTimeEvents.forEach((evt) => socket.off(evt, handleRealTimeUpdate))
      socket.off("reconnect", handleReconnect)
      unsubscribeFromStation(stationInfo.stationId)
    }
  }, [stationInfo?.stationId, applyRealtimeBookingUpdate, fetchStationAndQueue])

  // 3. Operational Filtered Queue List
  const queueList = useMemo(() => {
    const filtered = bookings.filter((b) => {
      if (filterType === "WAITING") return b.status === "CHECK_IN" || b.status === "CHECKED_IN"
      if (filterType === "IN_SERVICE") return b.status === "IN_SERVICE"
      if (filterType === "AWAITING_HANDOVER")
        return (
          b.status === "SERVICE_COMPLETED" ||
          b.status === "AWAITING_HANDOVER" ||
          b.status === "AWAITING_CONFIRMATION"
        )
      if (filterType === "STALLED") return b.status === "STALLED"
      return true
    })

    // Sort order: IN_SERVICE first, then earliest checked-in arrival
    return filtered.sort((a, b) => {
      if (a.status === "IN_SERVICE" && b.status !== "IN_SERVICE") return -1
      if (b.status === "IN_SERVICE" && a.status !== "IN_SERVICE") return 1
      return getCheckInTime(a) - getCheckInTime(b)
    })
  }, [bookings, filterType, getCheckInTime])

  // Counts for operational filter tabs
  const filterCounts = useMemo(() => {
    return {
      all: bookings.length,
      waiting: bookings.filter((b) => b.status === "CHECK_IN" || b.status === "CHECKED_IN").length,
      inService: bookings.filter((b) => b.status === "IN_SERVICE").length,
      handover: bookings.filter(
        (b) =>
          b.status === "SERVICE_COMPLETED" ||
          b.status === "AWAITING_HANDOVER" ||
          b.status === "AWAITING_CONFIRMATION"
      ).length,
      stalled: bookings.filter((b) => b.status === "STALLED").length,
    }
  }, [bookings])

  // Active Selected Booking Details
  const selectedBooking = useMemo(() => {
    if (!selectedBookingId) return null
    return bookings.find((b) => b.id === selectedBookingId) || null
  }, [bookings, selectedBookingId])

  // Live "In Progress" Session Timer for IN_SERVICE vehicle
  const serviceStartedAt = selectedBooking?.serviceStartedAt
  const isSelectedBookingInService =
    !!selectedBooking && selectedBooking.status === "IN_SERVICE" && !!serviceStartedAt
  const [nowTick, setNowTick] = useState(() => Date.now())

  useEffect(() => {
    if (!isSelectedBookingInService) return
    const timerId = setInterval(() => setNowTick(Date.now()), 1000)
    return () => clearInterval(timerId)
  }, [isSelectedBookingInService])

  const elapsedSeconds = useMemo(() => {
    if (!isSelectedBookingInService || !serviceStartedAt) return 0
    const startTime = new Date(serviceStartedAt).getTime()
    return Math.max(0, Math.floor((nowTick - startTime) / 1000))
  }, [isSelectedBookingInService, serviceStartedAt, nowTick])

  const formattedSessionTimer = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60)
    const secs = elapsedSeconds % 60
    const hrs = Math.floor(mins / 60)
    const remMins = mins % 60
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(remMins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }, [elapsedSeconds])

  // KPI Calculations
  const activeQueueCount = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.status === "CHECK_IN" ||
        b.status === "CHECKED_IN" ||
        b.status === "IN_SERVICE"
    ).length
  }, [bookings])
  const estimatedWaitMinutes = activeQueueCount * 15

  // Real per-vehicle queue position / wait estimate / bay assignment
  const getQueueMeta = useCallback(
    (bookingId: string) => {
      if (!liveQueueData) return null
      return (
        liveQueueData.waitingQueue.find((w) => w.bookingId === bookingId) ||
        liveQueueData.activeServices.find((a) => a.bookingId === bookingId) ||
        null
      )
    },
    [liveQueueData]
  )

  // Handle Advance Booking Status
  const handleAdvanceStatus = async (targetStatus: string) => {
    if (!selectedBooking) return

    // If manager clicks Complete Service on an IN_SERVICE vehicle -> open Post-Inspection workflow
    if (
      targetStatus === "SERVICE_COMPLETED" ||
      (selectedBooking.status === "IN_SERVICE" && targetStatus === "COMPLETED")
    ) {
      navigate(`/manager/bookings/${selectedBooking.id}/post-inspection`)
      return
    }

    setIsAdvancing(true)
    try {
      let updated: BookingResponse
      if (targetStatus === "IN_SERVICE") {
        updated = await bookingApi.startService(selectedBooking.id)
        toast.success("✓ Wash service started! Vehicle moved to Bay.")
      } else if (targetStatus === "COMPLETED") {
        updated = await bookingApi.completeHandover(selectedBooking.id)
        toast.success("✓ Vehicle handover completed & booking closed!")
      } else {
        updated = await bookingApi.advanceStatus(selectedBooking.id, targetStatus)
        toast.success(`Booking status updated to ${targetStatus.replace("_", " ")}`)
      }
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
      fetchStationAndQueue(true)
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      console.error("Status update error:", err)
      toast.error(errorObj?.message || "Failed to update booking status")
    } finally {
      setIsAdvancing(false)
    }
  }

  // Handle Stalling
  const handleConfirmStall = async () => {
    if (!stallingBookingId || !stallReasonInput.trim()) {
      toast.error("Please provide a reason for stalling the booking")
      return
    }

    try {
      setIsAdvancing(true)
      const updated = await bookingApi.stallBooking(stallingBookingId, stallReasonInput.trim())
      toast.warning("Booking moved to STALLED state")
      setStallingBookingId(null)
      setStallReasonInput("")
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
      fetchStationAndQueue(true)
    } catch (err) {
      console.error("Failed to stall booking:", err)
      toast.error("Failed to stall booking")
    } finally {
      setIsAdvancing(false)
    }
  }

  // Handle Resolving Stalled
  const handleConfirmResolveStalled = async () => {
    if (!resolvingBookingId || !resolutionInput.trim()) {
      toast.error("Please provide resolution notes")
      return
    }

    try {
      setIsAdvancing(true)
      const updated = await bookingApi.resolveStalled(
        resolvingBookingId,
        resolutionInput.trim(),
        targetStatusInput
      )
      toast.success(`Stalled booking recovered to ${targetStatusInput}`)
      setResolvingBookingId(null)
      setResolutionInput("")
      setBookings((prev) => {
        const exists = prev.some((b) => b.id === updated.id)
        if (!isActiveQueueStatus(updated.status)) {
          return exists ? prev.filter((b) => b.id !== updated.id) : prev
        }
        return exists ? prev.map((b) => (b.id === updated.id ? updated : b)) : [...prev, updated]
      })
      fetchStationAndQueue(true)
    } catch (err) {
      console.error("Failed to resolve stalled booking:", err)
      toast.error("Failed to resolve stalled booking")
    } finally {
      setIsAdvancing(false)
    }
  }

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  // Determine vehicle image source (pre-inspection photo, vehicle image, or null)
  const selectedVehicleImage = useMemo(() => {
    if (!selectedBooking) return null
    if (
      selectedBooking.preServiceInspection?.photos &&
      selectedBooking.preServiceInspection.photos.length > 0
    ) {
      return selectedBooking.preServiceInspection.photos[0]
    }
    const vDetails = selectedBooking.vehicleDetails as { image?: string } | undefined
    return vDetails?.image || null
  }, [selectedBooking])

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 space-y-8">
      {/* 1. Top Summary Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {stationInfo?.stationName || "Airport Express Auto Care"}
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE STATION
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium bg-muted/60 px-4 py-2 rounded-xl border border-border">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <span>{currentDateFormatted}</span>
        </div>
      </div>

      {/* KPI Cards Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Today's Bookings */}
        <div className="rounded-3xl bg-card text-card-foreground p-6 border border-border space-y-3 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            TODAY&apos;S BOOKINGS
          </span>
          <div className="text-4xl font-extrabold text-primary">
            {isLoading ? "..." : bookings.length}
          </div>
          <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
            <span>+12% from yesterday</span>
          </p>
        </div>

        {/* Card 2: Active Queue */}
        <div className="rounded-3xl bg-card text-card-foreground p-6 border border-border space-y-3 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ACTIVE QUEUE DEPTH
          </span>
          <div className="text-4xl font-extrabold text-primary">
            {isLoading ? "..." : liveQueueData ? liveQueueData.queueDepth : activeQueueCount}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              Est. Wait:{" "}
              {liveQueueData
                ? `${Math.ceil((liveQueueData.queueDepth / (liveQueueData.totalBays || 1)) * liveQueueData.averageWashDurationMinutes)}m`
                : `${estimatedWaitMinutes}m`}
            </span>
          </p>
        </div>

        {/* Card 3: Station Bay Capacity */}
        <div className="rounded-3xl bg-card text-card-foreground p-6 border border-border space-y-3 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            STATION BAYS
          </span>
          <div className="text-4xl font-extrabold text-primary">
            {liveQueueData ? `${liveQueueData.activeServicesCount}/${liveQueueData.totalBays}` : "1/1"}
          </div>
          <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
            <span>{liveQueueData ? `${liveQueueData.availableBays} bays available` : "Capacity Ok"}</span>
          </p>
        </div>

        {/* Card 4: New Check-in Action (Navigates to /manager/check-in without extra modals) */}
        <div
          onClick={() => navigate("/manager/check-in")}
          className="rounded-3xl bg-card text-card-foreground p-6 border border-primary/40 hover:border-primary transition-all cursor-pointer space-y-3 flex flex-col justify-between group shadow-md shadow-primary/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              NEW CHECK-IN
            </span>
            <QrCode className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Scan QR code or enter Booking ID to check in arriving customers.
          </p>
          <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Scan / Check-in <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* 2. Main Operational Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Single Unified Booking Queue List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Booking Queue
            </h2>
            <span className="px-3 py-1 rounded-lg bg-muted text-xs font-bold text-muted-foreground border border-border">
              FIFO Protocol
            </span>
          </div>

          {/* Operational Stage Filter Pills (No Completed History) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "ALL", label: "Active Queue", count: filterCounts.all },
              { id: "WAITING", label: "Waiting", count: filterCounts.waiting },
              { id: "IN_SERVICE", label: "In Service", count: filterCounts.inService },
              { id: "AWAITING_HANDOVER", label: "Ready", count: filterCounts.handover },
              ...(filterCounts.stalled > 0
                ? [{ id: "STALLED", label: "Stalled", count: filterCounts.stalled }]
                : []),
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id as QueueFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
                  filterType === t.id
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    filterType === t.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Single Unified Queue List Items */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[560px] pr-1">
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground text-sm rounded-3xl bg-card border border-border">
                Loading queue list...
              </div>
            ) : queueList.length === 0 ? (
              /* Enhanced Empty State for Queue List */
              <div className="p-8 sm:p-12 text-center rounded-3xl bg-card border border-dashed border-border/80 flex flex-col items-center justify-center space-y-4 shadow-sm">
                <div className="h-16 w-16 rounded-3xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-inner">
                  <Car className="h-8 w-8" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h3 className="text-base font-bold text-foreground">
                    {filterType === "ALL"
                      ? "No Vehicles in Live Queue"
                      : `No Vehicles in "${filterType.replace("_", " ")}"`}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    All arriving customers have been served or no active sessions are currently in progress.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/manager/check-in")}
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <QrCode className="h-3.5 w-3.5" /> Check-In Customer
                </button>
              </div>
            ) : (
              queueList.map((item, index) => {
                const isSelected = item.id === selectedBookingId
                const queueMeta = getQueueMeta(item.id)

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedBookingId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                      isSelected
                        ? "bg-card border-primary shadow-md shadow-primary/10 ring-1 ring-primary/30"
                        : item.status === "STALLED"
                        ? "bg-destructive/5 border-destructive/30 hover:border-destructive/60"
                        : item.status === "IN_SERVICE"
                        ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/60"
                        : "bg-card/60 border-border hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">
                        #{item.bookingNumber || `WQ-${index + 1}`}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.status === "STALLED"
                            ? "bg-destructive/15 text-destructive border border-destructive/30"
                            : item.status === "IN_SERVICE"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : item.status === "CHECKED_IN" || item.status === "CHECK_IN"
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          {item.vehicleDetails?.brand || "Vehicle"}{" "}
                          {item.vehicleDetails?.model || ""}
                        </h4>
                        <p className="text-xs text-muted-foreground font-mono">
                          {item.vehicleDetails?.registrationNumber ||
                            item.walkInVehicle?.registrationNumber ||
                            "N/A"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-foreground block">
                          ₹{item.pricingSnapshot?.totalPrice || 450}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {item.serviceType} Wash
                        </span>
                      </div>
                    </div>

                    {queueMeta ? (
                      <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground pt-1 border-t border-border/60">
                        {queueMeta.isBayActive ? (
                          <span className="text-amber-400 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                            Bay {queueMeta.assignedBayNumber ?? "1"} • In Service
                          </span>
                        ) : (
                          <>
                            <span className="text-primary">Position #{queueMeta.queuePosition}</span>
                            <span>~{queueMeta.estimatedWaitMinutes}m wait</span>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold text-muted-foreground pt-1 border-t border-border/60">
                        Position #{index + 1}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active Session (Designed Cleanly Matching Image 2 Reference) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Active Session</h2>
            <div className="flex items-center gap-2">
              {selectedBooking?.status === "IN_SERVICE" && (
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-muted border border-border">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    IN PROGRESS:
                  </span>
                  <span className="font-mono text-base font-bold text-primary">
                    {formattedSessionTimer}
                  </span>
                </div>
              )}
              {selectedBooking &&
                (selectedBooking.status === "CHECKED_IN" ||
                  selectedBooking.status === "IN_SERVICE") && (
                  <button
                    type="button"
                    onClick={() => {
                      setStallingBookingId(selectedBooking.id)
                      setStallReasonInput("")
                    }}
                    title="Report an operational issue and mark this booking stalled"
                    className="p-2.5 rounded-xl bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </button>
                )}
            </div>
          </div>

          <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-md min-h-[480px] flex flex-col justify-between">
            {!selectedBooking ? (
              /* Enhanced Empty State for Active Session */
              <div className="p-8 sm:p-16 my-auto text-center flex flex-col items-center justify-center space-y-4">
                <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                  <Sparkles className="h-10 w-10 animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-lg font-bold text-foreground">
                    Select a Vehicle from the Queue
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Click any vehicle in the live queue on the left to control the wash session, inspect photos, or complete handover.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
                {/* Top Section: Vehicle Image (Left) + Customer & Vehicle Details (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Left: Vehicle Image Preview */}
                  <div className="aspect-[16/10] w-full rounded-2xl border border-border overflow-hidden bg-black/40 flex items-center justify-center relative shadow-sm">
                    {selectedVehicleImage ? (
                      <img
                        src={selectedVehicleImage}
                        alt="Vehicle"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                        <Car className="h-12 w-12 text-muted-foreground/60" />
                        <span className="text-[11px] font-semibold text-muted-foreground/70">
                          {selectedBooking.vehicleDetails?.brand || "Vehicle"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Clean, Flat Customer & Vehicle Specs */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                        CUSTOMER &amp; VEHICLE
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-sm font-bold text-foreground">
                          {(
                            selectedBooking.customerDetails?.name ||
                            selectedBooking.walkInCustomer?.name ||
                            "Customer"
                          )
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-foreground">
                            {selectedBooking.customerDetails?.name ||
                              selectedBooking.walkInCustomer?.name ||
                              "Customer"}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {selectedBooking.customerDetails?.phone ||
                              selectedBooking.walkInCustomer?.phone ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 2-Column Minimal Specs */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-2">
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          MODEL
                        </span>
                        <p className="text-sm font-bold text-foreground">
                          {selectedBooking.vehicleDetails?.brand || "Vehicle"}{" "}
                          {selectedBooking.vehicleDetails?.model || ""}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          LICENSE PLATE
                        </span>
                        <p className="font-mono text-sm font-black text-primary">
                          {selectedBooking.vehicleDetails?.registrationNumber ||
                            selectedBooking.walkInVehicle?.registrationNumber ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          PAYMENT
                        </span>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold text-emerald-500">
                            {selectedBooking.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          PACKAGE
                        </span>
                        <p className="text-xs font-bold text-foreground">
                          {selectedBooking.serviceType === "FULL" ? "Full Wash" : "Half Wash"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Section: Service Details (Horizontal Pill Chips) */}
                <div className="pt-3">
                  <div className="p-4 rounded-2xl bg-muted/40 border-l-4 border-primary space-y-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">
                      SERVICE DETAILS
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 text-primary text-xs font-bold">
                        <Droplets className="h-3.5 w-3.5" />
                        {selectedBooking.serviceType === "FULL" ? "Full Premium Wash" : "Express Half Wash"}
                      </span>
                      {(selectedBooking.extraServices || []).map((extra) => (
                        <span
                          key={extra.serviceId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-foreground border border-border text-xs font-bold"
                        >
                          <Wrench className="h-3.5 w-3.5 text-primary" />
                          {extra.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Primary Action Buttons */}
                <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
                  {selectedBooking.status === "STALLED" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setResolvingBookingId(selectedBooking.id)
                        setResolutionInput("")
                        setTargetStatusInput("CHECKED_IN")
                      }}
                      disabled={isAdvancing}
                      className="col-span-2 py-3.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wide hover:bg-amber-400 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Clock className="h-4 w-4" /> Resolve Stalled Issue
                    </button>
                  ) : selectedBooking.status === "SERVICE_COMPLETED" ||
                    selectedBooking.status === "AWAITING_HANDOVER" ||
                    selectedBooking.status === "AWAITING_CONFIRMATION" ? (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus("COMPLETED")}
                      disabled={isAdvancing}
                      className="col-span-2 py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wide hover:bg-emerald-500 transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 shadow-md"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Handover Vehicle &amp; Close Booking
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAdvanceStatus("IN_SERVICE")}
                        disabled={isAdvancing || selectedBooking.status !== "CHECKED_IN"}
                        className="py-3.5 rounded-xl bg-muted text-muted-foreground font-extrabold text-xs uppercase tracking-wide hover:bg-muted/70 transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                      >
                        <Play className="h-4 w-4 fill-current" /> Start Service
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (selectedBooking.status === "IN_SERVICE") {
                            navigate(`/manager/bookings/${selectedBooking.id}/post-inspection`)
                          } else {
                            handleAdvanceStatus("COMPLETED")
                          }
                        }}
                        disabled={
                          isAdvancing ||
                          selectedBooking.status === "COMPLETED" ||
                          selectedBooking.status === "STALLED" ||
                          selectedBooking.status === "CHECKED_IN"
                        }
                        className="py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wide hover:bg-emerald-500 transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 shadow-md"
                      >
                        <Check className="h-4 w-4 stroke-[3]" /> Mark Completed
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mark Stalled Modal */}
      {stallingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-destructive/40 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xl font-bold text-destructive">Stall Booking</h3>
              <button
                onClick={() => setStallingBookingId(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-muted-foreground font-medium">
                Marking a booking as STALLED retains it in the operational queue dashboard while indicating an exception (e.g. payment issue, inspection dispute, vehicle problem).
              </p>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  STALL REASON / EXCEPTION DETAILS
                </label>
                <textarea
                  value={stallReasonInput}
                  onChange={(e) => setStallReasonInput(e.target.value)}
                  placeholder="Describe the operational exception..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-destructive transition-colors resize-none"
                />
              </div>

              <button
                onClick={handleConfirmStall}
                disabled={isAdvancing || !stallReasonInput.trim()}
                className="w-full py-3.5 rounded-2xl bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              >
                {isAdvancing ? "Stalling..." : "Confirm Move to STALLED"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Stalled Modal */}
      {resolvingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-amber-500/40 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xl font-bold text-amber-500">Resolve Stalled Issue</h3>
              <button
                onClick={() => setResolvingBookingId(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  RECOVERY TARGET ACTION
                </label>
                <select
                  value={targetStatusInput}
                  onChange={(e) =>
                    setTargetStatusInput(
                      e.target.value as "CHECKED_IN" | "IN_SERVICE" | "CANCELLED"
                    )
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-muted border border-border text-foreground font-bold text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="CHECKED_IN">Re-enter Waiting Queue (CHECKED_IN)</option>
                  <option value="IN_SERVICE">Resume Wash Service (IN_SERVICE)</option>
                  <option value="CANCELLED">Cancel Booking &amp; Process Refund</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  RESOLUTION NOTES
                </label>
                <textarea
                  value={resolutionInput}
                  onChange={(e) => setResolutionInput(e.target.value)}
                  placeholder="Enter resolution notes..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              <button
                onClick={handleConfirmResolveStalled}
                disabled={isAdvancing || !resolutionInput.trim()}
                className="w-full py-3.5 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              >
                {isAdvancing ? "Resolving..." : "Complete Recovery Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
