import { useNavigate } from "react-router-dom"
import { XCircle, Sparkles, CheckCircle2, Phone, Printer } from "lucide-react"
import { toast } from "sonner"
import { bookingApi, type BookingResponse } from "@/shared/apis/booking.api"
import { useState } from "react"

interface StaffBookingActionsProps {
  booking: BookingResponse
  onOpenCancelModal: () => void
  onAdvanceStatus?: (targetStatus: string) => Promise<void>
  isAdvancingStatus?: boolean
}

export function StaffHeaderActions({
  booking,
  onOpenCancelModal,
  onAdvanceStatus,
  isAdvancingStatus = false,
}: StaffBookingActionsProps) {
  const customerPhone = booking.customerDetails?.phone || booking.walkInCustomer?.phone || "N/A"
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const handleDownloadInvoice = async () => {
    try {
      setIsDownloading(true)
      toast.info("Generating invoice PDF...")
      await bookingApi.downloadInvoice(booking.id, booking.bookingNumber)
      toast.success("Invoice downloaded successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to download invoice")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {(booking.status === "CONFIRMED" || booking.status === "PENDING") && (
        <button
          type="button"
          onClick={onOpenCancelModal}
          className="px-4 py-2.5 rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
        >
          <XCircle size={14} />
          <span>Cancel Booking</span>
        </button>
      )}

      {booking.status === "CHECKED_IN" && onAdvanceStatus && (
        <button
          type="button"
          onClick={() => onAdvanceStatus("IN_SERVICE")}
          disabled={isAdvancingStatus}
          className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-black text-xs hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-primary/20"
        >
          <Sparkles size={14} />
          <span>Start Washing</span>
        </button>
      )}

      {booking.status === "IN_SERVICE" && onAdvanceStatus && (
        <button
          type="button"
          onClick={() => onAdvanceStatus("COMPLETED")}
          disabled={isAdvancingStatus}
          className="px-5 py-2.5 rounded-full bg-emerald-500 text-primary-foreground font-black text-xs hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
        >
          <CheckCircle2 size={14} />
          <span>Mark Completed</span>
        </button>
      )}

      {customerPhone !== "N/A" && (
        <button
          type="button"
          onClick={() => toast.info(`Calling ${customerPhone}...`)}
          className="px-4 py-2.5 rounded-full bg-card border border-border text-foreground hover:bg-muted text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Phone size={14} className="text-primary" />
          <span>Contact Customer</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => handleDownloadInvoice()}
        className="p-2.5 rounded-full bg-card border border-border text-foreground hover:bg-muted transition-all cursor-pointer"
        title="Print Summary"
        disabled={isDownloading}
      >
        <Printer size={15} />
      </button>
    </div>
  )
}

export function StaffSidebarWorkflowPanel({
  booking,
  onAdvanceStatus,
  isAdvancingStatus = false,
}: {
  booking: BookingResponse
  onAdvanceStatus?: (targetStatus: string) => Promise<void>
  isAdvancingStatus?: boolean
}) {
  const navigate = useNavigate()

  return (
    <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-3 text-left">
      {booking.status === "IN_SERVICE" && onAdvanceStatus && (
        <button
          type="button"
          onClick={() => onAdvanceStatus("COMPLETED")}
          disabled={isAdvancingStatus}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20"
        >
          MARK SERVICE COMPLETE
        </button>
      )}

      {booking.status === "CHECKED_IN" && onAdvanceStatus && (
        <button
          type="button"
          onClick={() => onAdvanceStatus("IN_SERVICE")}
          disabled={isAdvancingStatus}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20"
        >
          START SERVICE
        </button>
      )}

      {booking.status === "SERVICE_COMPLETED" && onAdvanceStatus && (
        <button
          type="button"
          onClick={() => onAdvanceStatus("COMPLETED")}
          disabled={isAdvancingStatus}
          className="w-full py-4 rounded-2xl bg-emerald-500 text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          COMPLETE &amp; HANDOVER
        </button>
      )}

      {(booking.status === "CONFIRMED" || booking.status === "PENDING") && (
        <button
          type="button"
          onClick={() =>
            navigate("/owner/check-in", { state: { bookingNumber: booking.bookingNumber } })
          }
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20"
        >
          CHECK-IN VEHICLE
        </button>
      )}

      {(booking.status === "CONFIRMED" ||
        booking.status === "PENDING" ||
        booking.status === "CHECKED_IN") &&
        onAdvanceStatus && (
          <button
            type="button"
            onClick={() => onAdvanceStatus("NO_SHOW")}
            disabled={isAdvancingStatus}
            className="w-full py-3 rounded-2xl border border-destructive/40 text-destructive/80 hover:text-destructive text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            MARK NO-SHOW
          </button>
        )}

      {(booking.status === "CANCELLED" || booking.status === "NO_SHOW") && (
        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-center text-xs font-semibold text-muted-foreground">
          {booking.status === "CANCELLED"
            ? "Booking is Cancelled & Closed"
            : "Customer Marked No-Show"}
        </div>
      )}

      {booking.status === "COMPLETED" && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-bold text-emerald-500 flex items-center justify-center gap-2">
          <CheckCircle2 size={16} />
          <span>Service Completed &amp; Handed Over</span>
        </div>
      )}
    </div>
  )
}
