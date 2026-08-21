import { toast } from "sonner"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { RefreshCw, AlertTriangle, ArrowLeft } from "lucide-react"
import { ROLE, type RoleType } from "@/shared/constants/role.const"
import { bookingApi, type BookingResponse } from "@/shared/apis/booking.api"
import CancellationModal from "../components/CancellationModal"
import RescheduleModal from "../components/RescheduleModal"
import CustomerBookingDetailsView from "../components/details/CustomerBookingDetailsView"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import ProviderBookingDetailsView from "../components/details/ProviderBookingDetailsView"
import Loading from "@/shared/components/ui/Loading"
import { getSocketClient } from "@/shared/services/socket.client"

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cancellation & Reschedule Modal states
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)

  // Status Advance state
  const [isAdvancingStatus, setIsAdvancingStatus] = useState(false)

  // Determine role context strictly based on the route being visited
  const currentRole: RoleType = useMemo(() => {
    if (location.pathname.startsWith("/admin")) return ROLE.ADMIN
    if (location.pathname.startsWith("/owner")) return ROLE.OWNER
    if (location.pathname.startsWith("/manager")) return ROLE.MANAGER

    // If on /bookings/:id (or any user route), always render the customer view
    return ROLE.CUSTOMER
  }, [location.pathname])

  const isCustomer = currentRole === ROLE.CUSTOMER
  const isManager = currentRole === ROLE.MANAGER
  const isOwner = currentRole === ROLE.OWNER
  const isAdmin = currentRole === ROLE.ADMIN


  // Load Booking Details helper
  const fetchBookingDetails = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await bookingApi.getBookingById(id)
      setBooking(data)
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      console.error("Failed to load booking details:", err)
      setError(errorObj?.message || "Booking details not found.")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    let isMounted = true

    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await bookingApi.getBookingById(id)
        if (isMounted) setBooking(data)
      } catch (err: unknown) {
        const errorObj = err as { message?: string }
        console.error("Failed to load booking details:", err)
        if (isMounted) setError(errorObj?.message || "Booking details not found.")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [id])

  // Real-Time Socket.IO Subscription — keep this booking's status/progress live
  // without a full reload; the manager side emits every status change into this room.
  useEffect(() => {
    if (!id) return
    const socket = getSocketClient()
    socket.emit("join_booking", { bookingId: id })

    const handleRealTimeUpdate = () => {
      bookingApi
        .getBookingById(id)
        .then((data) => setBooking(data))
        .catch((err) => console.error("Failed to sync booking from real-time event:", err))
    }

    const realTimeEvents = [
      "CHECKIN_SUCCESS",
      "BOOKING_CHECKED_IN",
      "WASH_STARTED",
      "SERVICE_STARTED",
      "WASH_COMPLETED",
      "SERVICE_COMPLETED",
      "POST_INSPECTION_COMPLETED",
      "HANDOVER_READY",
      "BOOKING_COMPLETED",
      "BOOKING_CANCELLED",
      "BOOKING_RESCHEDULED",
      "BOOKING_NO_SHOW",
      "BOOKING_STALLED",
      "QUEUE_POSITION_CHANGED",
      "PAYMENT_UPDATED",
      "REFUND_PROCESSED",
    ]

    realTimeEvents.forEach((evt) => socket.on(evt, handleRealTimeUpdate))
    socket.on("reconnect", handleRealTimeUpdate)

    return () => {
      realTimeEvents.forEach((evt) => socket.off(evt, handleRealTimeUpdate))
      socket.off("reconnect", handleRealTimeUpdate)
    }
  }, [id])

  // Handle Status Transition for Staff/Manager/Owner/Admin
  const handleAdvanceStatus = async (targetStatus: string) => {
    if (!booking) return
    setIsAdvancingStatus(true)
    try {
      const updated = await bookingApi.advanceStatus(booking.id, targetStatus)
      toast.success(`Status updated to ${targetStatus.replace("_", " ")}`)
      setBooking(updated)
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      toast.error(errorObj?.message || "Failed to update status")
    } finally {
      setIsAdvancingStatus(false)
    }
  }

  // Derived Info
  const formattedDates = useMemo(() => {
    if (!booking?.scheduling) return { dateStr: "", timeStr: "" }
    const start = new Date(booking.scheduling.windowStart)
    const end = new Date(booking.scheduling.windowEnd)

    const dateStr = start.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    const timeStr = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`

    return { dateStr, timeStr }
  }, [booking])

  // Progress Stages logic
  const stages = [
    { id: "CONFIRMED", label: "Confirmed" },
    { id: "CHECKED_IN", label: "Arrived" },
    { id: "IN_QUEUE", label: "In Queue" },
    { id: "IN_SERVICE", label: "Washing" },
    { id: "COMPLETED", label: "Ready" },
  ]

  const currentStageIndex = useMemo(() => {
    if (!booking) return 0
    const s = booking.status
    if (s === "PENDING" || s === "CONFIRMED") return 0
    if (s === "CHECKED_IN") return 1
    if (s === "IN_SERVICE") return 3
    if (s === "SERVICE_COMPLETED" || s === "AWAITING_HANDOVER" || s === "COMPLETED") return 4
    if (s === "CANCELLED" || s === "NO_SHOW") return -1
    return 2
  }, [booking])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-foreground">
        <Loading size="lg" text="Retrieving booking details..." />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen max-w-4xl mx-auto px-4 pt-16 pb-20 text-left space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Bookings</span>
        </button>

        <div className="p-8 rounded-3xl bg-card border border-red-500/20 text-center space-y-4 shadow-xl">
          <AlertTriangle size={48} className="text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Unable to Load Booking</h2>
          <p className="text-xs text-muted-foreground">{error || "Booking not found."}</p>
          <button
            type="button"
            onClick={() => fetchBookingDetails()}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    )
  }

  const rootPath = isAdmin
    ? "/admin/dashboard"
    : isOwner
      ? "/owner/dashboard"
      : isManager
        ? "/manager/dashboard"
        : "/"

  const rootLabel = isAdmin
    ? "Admin"
    : isOwner
      ? "Owner"
      : isManager
        ? "Manager"
        : "Home"

  const bookingsListPath = isAdmin
    ? "/admin/bookings"
    : isOwner
      ? "/owner/bookings"
      : isManager
        ? "/manager/bookings"
        : "/bookings"

  const bookingsListLabel = isCustomer ? "My Bookings" : "Bookings"

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-20 space-y-6 min-h-screen text-left animate-in fade-in duration-300">
      {/* Universal Breadcrumbs & Top Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/60">
        <Breadcrumbs
          items={[
            {
              label: rootLabel,
              path: rootPath,
            },
            {
              label: bookingsListLabel,
              path: bookingsListPath,
            },
            { label: `#${booking.bookingNumber}` },
          ]}
        />

        <button
          type="button"
          onClick={() => fetchBookingDetails()}
          className="px-4 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
          title="Refresh booking details"
        >
          <RefreshCw
            size={14}
            className={isLoading ? "animate-spin text-primary" : "text-primary"}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Role-Based Dynamic View Rendering */}
      {isCustomer ? (
        <CustomerBookingDetailsView
          booking={booking}
          formattedDates={formattedDates}
          currentStageIndex={currentStageIndex}
          stages={stages}
          onOpenCancelModal={() => setIsCancelModalOpen(true)}
          onOpenRescheduleModal={() => setIsRescheduleModalOpen(true)}
        />
      ) : (
        <ProviderBookingDetailsView
          booking={booking}
          formattedDates={formattedDates}
          currentStageIndex={currentStageIndex}
          onOpenCancelModal={() => setIsCancelModalOpen(true)}
          onAdvanceStatus={handleAdvanceStatus}
          isAdvancingStatus={isAdvancingStatus}
        />
      )}

      {/* Reschedule Booking Modal */}
      {isRescheduleModalOpen && booking && (
        <RescheduleModal
          booking={booking}
          isOpen={isRescheduleModalOpen}
          onClose={() => setIsRescheduleModalOpen(false)}
          onSuccess={(updated) => setBooking(updated)}
        />
      )}

      {/* Figma Designed Cancellation Confirmation & Success Modal */}
      {isCancelModalOpen && booking && (
        <CancellationModal
          booking={booking}
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirmCancel={async (reason) => {
            const updated = await bookingApi.cancelBooking(booking.id, reason)
            setBooking(updated)
            toast.success(`Booking #${booking.bookingNumber} has been cancelled cleanly.`)
          }}
          onBookAgain={() => navigate("/book")}
          onBackToHome={() => navigate("/")}
        />
      )}
    </div>
  )
}
