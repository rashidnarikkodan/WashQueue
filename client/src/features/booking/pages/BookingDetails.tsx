import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, RefreshCw, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import Loading from "@/shared/components/ui/Loading"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { ROLE, VIEW_MODE, type RoleType } from "@/shared/constants/role.const"
import { bookingApi, type BookingResponse } from "@/shared/apis/booking.api"
import CustomerBookingDetailsView from "../components/details/CustomerBookingDetailsView"
import ProviderBookingDetailsView from "../components/details/ProviderBookingDetailsView"
import { toast } from "sonner"

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, activeViewMode } = useAuthStore()

  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cancellation Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false)

  // Status Advance state
  const [isAdvancingStatus, setIsAdvancingStatus] = useState(false)

  // Determine role context
  const currentRole: RoleType = useMemo(() => {
    if (activeViewMode === VIEW_MODE.CUSTOMER) return ROLE.CUSTOMER
    if (activeViewMode === VIEW_MODE.MANAGER) return ROLE.MANAGER
    if (activeViewMode === VIEW_MODE.OWNER) return ROLE.OWNER

    return user?.role ? (user.role as RoleType) : ROLE.CUSTOMER
  }, [user?.role, activeViewMode])

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

  // Handle Cancel Action
  const handleCancelBooking = async () => {
    if (!booking) return
    setIsSubmittingCancel(true)
    try {
      const updated = await bookingApi.cancelBooking(
        booking.id,
        cancellationReason || "Customer cancelled booking"
      )
      toast.success(`Booking ${booking.bookingNumber} has been cancelled.`)
      setBooking(updated)
      setIsCancelModalOpen(false)
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      toast.error(errorObj?.message || "Failed to cancel booking")
    } finally {
      setIsSubmittingCancel(false)
    }
  }

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

  const backPath = isAdmin
    ? "/admin/bookings"
    : isOwner
      ? "/owner/bookings"
      : isManager
        ? "/manager/bookings"
        : "/bookings"

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-20 space-y-8 min-h-screen text-left animate-in fade-in duration-300">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            {
              label: isAdmin ? "Admin" : isOwner ? "Owner" : isManager ? "Manager" : "Home",
              path: backPath,
            },
            { label: "Bookings", path: backPath },
            { label: `#${booking.bookingNumber}` },
          ]}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="px-3.5 py-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>Back to List</span>
          </button>
          <button
            type="button"
            onClick={() => fetchBookingDetails()}
            className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
            title="Refresh Details"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-primary" : ""} />
          </button>
        </div>
      </div>

      {/* Role-Based Dynamic View Rendering */}
      {isCustomer ? (
        <CustomerBookingDetailsView
          booking={booking}
          formattedDates={formattedDates}
          currentStageIndex={currentStageIndex}
          stages={stages}
          onOpenCancelModal={() => setIsCancelModalOpen(true)}
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

      {/* Cancel Confirmation Dialog Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border/80 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-3 text-red-400">
              <XCircle size={24} />
              <h3 className="text-lg font-extrabold text-foreground">Cancel Booking</h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to cancel booking{" "}
              <strong className="text-foreground font-mono">#{booking.bookingNumber}</strong>?
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Reason for Cancellation
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please state why you are cancelling..."
                className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isSubmittingCancel}
                className="px-4 py-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-bold cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={isSubmittingCancel}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isSubmittingCancel ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Confirm Cancel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
