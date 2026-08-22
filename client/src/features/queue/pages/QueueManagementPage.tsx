import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { managerApi } from "@/shared/apis/manager.api"
import { bookingApi } from "@/shared/apis/booking.api"
import type { BookingResponse } from "@/shared/apis/booking.api"
import {
  getSocketClient,
  subscribeToStation,
  unsubscribeFromStation,
} from "@/shared/services/socket.client"
import { QueuePageHeader } from "@/features/queue/components/queue-management/QueuePageHeader"
import { KpiCardsGrid } from "@/features/queue/components/queue-management/KpiCardsGrid"
import { BookingQueuePanel } from "@/features/queue/components/queue-management/BookingQueuePanel"
import { ActiveSessionPanel } from "@/features/queue/components/queue-management/ActiveSessionPanel"
import { StallBookingModal } from "@/features/queue/components/queue-management/StallBookingModal"
import { ResolveStalledModal } from "@/features/queue/components/queue-management/ResolveStalledModal"
import type { LiveQueueData, QueueFilter } from "@/features/queue/components/queue-management/types"

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

  const [stallingBookingId, setStallingBookingId] = useState<string | null>(null)
  const [stallReasonInput, setStallReasonInput] = useState("")
  const [resolvingBookingId, setResolvingBookingId] = useState<string | null>(null)
  const [resolutionInput, setResolutionInput] = useState("")
  const [targetStatusInput, setTargetStatusInput] = useState<
    "CHECKED_IN" | "IN_SERVICE" | "CANCELLED"
  >("CHECKED_IN")

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

  const [liveQueueData, setLiveQueueData] = useState<LiveQueueData | null>(null)

  const fetchStationAndQueue = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true)
      try {
        const stations = await managerApi.getManagedStation()
        
        if (stations && stations.length > 0) {
          const activeStation = stations[0]
          setStationInfo({
            stationId: activeStation.stationId,
            stationName: activeStation.stationName,
          })

          try {
            const liveQ = await bookingApi.getLiveQueue(activeStation.stationId)
            setLiveQueueData(liveQ)
          } catch {}

          const res = await bookingApi.getUserBookings({
            stationId: activeStation.stationId,
            limit: 100,
          })
          const allBookings = res.bookings || []

          const activeList = allBookings.filter((b: BookingResponse) =>
            isActiveQueueStatus(b.status)
          )
          setBookings(activeList)

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
    },
    [getCheckInTime]
  )

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

  const applyRealtimeBookingUpdate = useCallback(
    async (bookingId?: string) => {
      if (!stationInfo?.stationId) return

      try {
        const liveQ = await bookingApi.getLiveQueue(stationInfo.stationId)
        setLiveQueueData(liveQ)
      } catch {}

      if (!bookingId) return

      try {
        const updated = await bookingApi.getBookingById(bookingId)
        setBookings((prev) => {
          const exists = prev.some((b) => b.id === updated.id)
          if (!isActiveQueueStatus(updated.status)) {
            return exists ? prev.filter((b) => b.id !== updated.id) : prev
          }
          return exists ? prev.map((b) => (b.id === updated.id ? updated : b)) : [...prev, updated]
        })
      } catch (err) {
        console.error("Failed to sync booking from real-time event:", err)
      }
    },
    [stationInfo?.stationId]
  )

  useEffect(() => {
    if (!stationInfo?.stationId) return

    subscribeToStation(stationInfo.stationId)
    const socket = getSocketClient()

    const handleRealTimeUpdate = (payload?: { bookingId?: string }) => {
      void applyRealtimeBookingUpdate(payload?.bookingId)
    }

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

    return filtered.sort((a, b) => {
      if (a.status === "IN_SERVICE" && b.status !== "IN_SERVICE") return -1
      if (b.status === "IN_SERVICE" && a.status !== "IN_SERVICE") return 1
      return getCheckInTime(a) - getCheckInTime(b)
    })
  }, [bookings, filterType, getCheckInTime])

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

  const selectedBooking = useMemo(() => {
    if (!selectedBookingId) return null
    return bookings.find((b) => b.id === selectedBookingId) || null
  }, [bookings, selectedBookingId])

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

  const activeQueueCount = useMemo(() => {
    return bookings.filter(
      (b) => b.status === "CHECK_IN" || b.status === "CHECKED_IN" || b.status === "IN_SERVICE"
    ).length
  }, [bookings])
  const estimatedWaitMinutes = activeQueueCount * 15

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

  const handleAdvanceStatus = async (targetStatus: string) => {
    if (!selectedBooking) return

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

  const goToCheckIn = useCallback(() => navigate("/manager/check-in"), [navigate])
  const goToPostInspection = useCallback(
    (bookingId: string) => navigate(`/manager/bookings/${bookingId}/post-inspection`),
    [navigate]
  )

  const openStallModal = useCallback((bookingId: string) => {
    setStallingBookingId(bookingId)
    setStallReasonInput("")
  }, [])

  const openResolveStalledModal = useCallback((bookingId: string) => {
    setResolvingBookingId(bookingId)
    setResolutionInput("")
    setTargetStatusInput("CHECKED_IN")
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 space-y-8">
      <QueuePageHeader
        stationName={stationInfo?.stationName || "Your Station"}
        currentDateFormatted={currentDateFormatted}
      />

      <KpiCardsGrid
        isLoading={isLoading}
        bookingsCount={bookings.length}
        liveQueueData={liveQueueData}
        activeQueueCount={activeQueueCount}
        estimatedWaitMinutes={estimatedWaitMinutes}
        onCheckInClick={goToCheckIn}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <BookingQueuePanel
          isLoading={isLoading}
          queueList={queueList}
          filterType={filterType}
          filterCounts={filterCounts}
          selectedBookingId={selectedBookingId}
          getQueueMeta={getQueueMeta}
          onFilterChange={setFilterType}
          onSelectBooking={setSelectedBookingId}
          onCheckInClick={goToCheckIn}
        />

        <ActiveSessionPanel
          selectedBooking={selectedBooking}
          selectedVehicleImage={selectedVehicleImage}
          isAdvancing={isAdvancing}
          formattedSessionTimer={formattedSessionTimer}
          onAdvanceStatus={handleAdvanceStatus}
          onStallClick={openStallModal}
          onResolveStalledClick={openResolveStalledModal}
          onGoToPostInspection={goToPostInspection}
        />
      </div>

      <StallBookingModal
        isOpen={!!stallingBookingId}
        reasonInput={stallReasonInput}
        isAdvancing={isAdvancing}
        onReasonInputChange={setStallReasonInput}
        onConfirm={handleConfirmStall}
        onClose={() => setStallingBookingId(null)}
      />

      <ResolveStalledModal
        isOpen={!!resolvingBookingId}
        resolutionInput={resolutionInput}
        targetStatusInput={targetStatusInput}
        isAdvancing={isAdvancing}
        onResolutionInputChange={setResolutionInput}
        onTargetStatusChange={setTargetStatusInput}
        onConfirm={handleConfirmResolveStalled}
        onClose={() => setResolvingBookingId(null)}
      />
    </div>
  )
}
