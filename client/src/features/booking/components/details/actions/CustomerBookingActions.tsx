import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Star,
  XCircle,
  CalendarClock,
  Download,
  Loader2,
  Phone,
  MessageSquare,
  LifeBuoy,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import type { BookingResponse } from "@/shared/apis/booking.api"
import { bookingApi } from "@/shared/apis/booking.api"
import { useReviewModalStore } from "@/features/review/store/review-modal.store"
import CreateIssueModal from "@/features/issue/components/CreateIssueModal"
import { getServiceDisplayName, getVehicleDisplayName } from "../../../utils/booking-display.utils"

interface CustomerBookingActionsProps {
  booking: BookingResponse
  formattedDates: { dateStr: string; timeStr: string }
  onOpenCancelModal: () => void
  onOpenRescheduleModal?: () => void
}

export function CustomerActionHeaderButtons({
  booking,
  formattedDates,
  onOpenCancelModal,
  onOpenRescheduleModal,
}: CustomerBookingActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [nowMs] = useState(() => Date.now())
  const openReviewModal = useReviewModalStore((state) => state.openReviewModal)

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

  const stationName = booking.stationDetails?.name || "Service Station"
  const serviceName = getServiceDisplayName(booking)
  const rescheduleCount = booking.rescheduleCount ?? 0
  const isMaxReschedulesReached = rescheduleCount >= 2

  const canReschedule = Boolean(
    (booking.status === "CONFIRMED" || booking.status === "PENDING") &&
    !booking.isWalkIn &&
    !isMaxReschedulesReached &&
    booking.scheduling?.windowStart &&
    new Date(booking.scheduling.windowStart).getTime() - nowMs >= 24 * 60 * 60 * 1000
  )

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border">
      <div className="flex flex-wrap items-center gap-3">
        {booking.status === "COMPLETED" && (
          <button
            type="button"
            onClick={() => {
              openReviewModal({
                bookingId: booking.id,
                stationId: booking.stationId,
                stationName,
                stationImage: booking.stationDetails?.images?.[0]?.url,
                serviceType: serviceName,
                dateTime: `${formattedDates.dateStr} • ${formattedDates.timeStr}`,
                bookingNumber: booking.bookingNumber,
              })
            }}
            className="px-5 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Star size={15} className="fill-amber-400 text-amber-400" />
            <span>Rate Experience</span>
          </button>
        )}

        {(booking.status === "CONFIRMED" || booking.status === "PENDING") && (
          <>
            <button
              type="button"
              onClick={onOpenCancelModal}
              className="px-5 py-2.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <XCircle size={15} />
              <span>Cancel Booking</span>
            </button>

            {!booking.isWalkIn && onOpenRescheduleModal && (
              <div className="relative group inline-block">
                <button
                  type="button"
                  onClick={onOpenRescheduleModal}
                  disabled={!canReschedule}
                  className="px-5 py-2.5 rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CalendarClock size={15} />
                  <span>
                    Reschedule
                    {rescheduleCount > 0 && ` (${rescheduleCount}/2)`}
                  </span>
                </button>

                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-max max-w-[260px] opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 transform group-hover:-translate-y-1">
                  <div className="p-3 rounded-2xl bg-popover border border-border text-popover-foreground shadow-2xl backdrop-blur-md text-left space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[11px]">
                      {isMaxReschedulesReached ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                          <span className="text-destructive">Limit Reached (2/2 Used)</span>
                        </>
                      ) : canReschedule ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-emerald-500">
                            {2 - rescheduleCount} Reschedule
                            {2 - rescheduleCount === 1 ? "" : "s"} Remaining
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <span className="text-amber-500">24h Cutoff Policy</span>
                        </>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {isMaxReschedulesReached
                        ? "Maximum limit of 2 reschedules reached for this booking."
                        : canReschedule
                          ? `You can reschedule up to 2 times (${2 - rescheduleCount} left). Available at least 24h prior to window.`
                          : "Rescheduling is only permitted at least 24 hours prior to the scheduled slot window start."}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-popover border-r border-b border-border rotate-45 mx-auto -mt-1" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        disabled={isDownloading}
        onClick={handleDownloadInvoice}
        className="px-5 py-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
        <span>{isDownloading ? "Downloading..." : "Download Invoice"}</span>
      </button>
    </div>
  )
}

export function CustomerSupportSidebarWidget({ booking }: { booking: BookingResponse }) {
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false)
  const [activeIssue, setActiveIssue] = useState<{ id: string } | null>(null)

  const stationName = booking.stationDetails?.name || "Service Station"
  const vehicleName = getVehicleDisplayName(booking)

  return (
    <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-4 text-left">
      <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">
        Support &amp; Assistance
      </h3>

      <div className="space-y-3">
        {booking.stationDetails?.phone && (
          <button
            type="button"
            onClick={() => toast.info(`Calling station at ${booking.stationDetails?.phone}`)}
            className="w-full p-3.5 rounded-2xl bg-muted/40 border border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-primary" />
              <span>Contact Station ({booking.stationDetails.phone})</span>
            </div>
            <ChevronRight size={14} className="text-muted-foreground" />
          </button>
        )}

        <button
          type="button"
          onClick={() => toast.info("Opening Live Support Chat...")}
          className="w-full p-3.5 rounded-2xl bg-muted/40 border border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <MessageSquare size={16} className="text-primary" />
            <span>Live Chat Support</span>
          </div>
          <ChevronRight size={14} className="text-muted-foreground" />
        </button>

        {activeIssue ? (
          <Link
            to={`/issues/${activeIssue.id}`}
            className="w-full p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <LifeBuoy size={16} className="text-amber-500" />
              <span>View Ticket #{activeIssue.id}</span>
            </div>
            <ChevronRight size={14} className="text-amber-500" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setIsRaiseTicketOpen(true)}
            className="w-full p-3.5 rounded-2xl bg-muted/40 border border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <LifeBuoy
                size={16}
                className="text-amber-500 group-hover:rotate-45 transition-transform duration-300"
              />
              <span>Raise a Ticket / Issue</span>
            </div>
            <ChevronRight size={14} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {isRaiseTicketOpen && (
        <CreateIssueModal
          isOpen={isRaiseTicketOpen}
          onClose={() => setIsRaiseTicketOpen(false)}
          bookingId={booking.id}
          bookingNumber={booking.bookingNumber}
          stationName={stationName}
          vehicleName={vehicleName}
          onSuccess={(created) => {
            setActiveIssue({ id: created.id })
          }}
        />
      )}
    </div>
  )
}
