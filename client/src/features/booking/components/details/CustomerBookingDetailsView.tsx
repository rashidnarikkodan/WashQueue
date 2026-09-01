import { useState } from "react"
import {
  Clock,
  Car,
  XCircle,
  Phone,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Download,
  Loader2,
  MessageSquare,
  ChevronRight,
  CalendarClock,
  Info,
  Camera,
  ClipboardCheck,
  LifeBuoy,
} from "lucide-react"
import QRCodePass from "@/shared/components/ui/QRCodePass"
import { bookingApi, type BookingResponse } from "@/shared/apis/booking.api"
import { toast } from "sonner"

interface CustomerBookingDetailsViewProps {
  booking: BookingResponse
  formattedDates: { dateStr: string; timeStr: string }
  currentStageIndex: number
  stages: Array<{ id: string; label: string }>
  onOpenCancelModal: () => void
  onOpenRescheduleModal?: () => void
}

export default function CustomerBookingDetailsView({
  booking,
  formattedDates,
  currentStageIndex,
  stages,
  onOpenCancelModal,
  onOpenRescheduleModal,
}: CustomerBookingDetailsViewProps) {
  const [isDownloading, setIsDownloading] = useState(false)

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
  const stationLocation = booking.stationDetails?.city || ""
  const vehicleName = booking.vehicleDetails?.nickname
    ? booking.vehicleDetails.nickname
    : booking.vehicleDetails?.brand
      ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model || ""}`.trim()
      : booking.walkInVehicle?.registrationNumber
        ? `Walk-In (${booking.walkInVehicle.registrationNumber})`
        : "Vehicle"
  const plateNumber =
    booking.vehicleDetails?.registrationNumber || booking.walkInVehicle?.registrationNumber || "N/A"
  const serviceName = booking.serviceType === "FULL" ? "Complete Full Wash" : "Express Half Wash"

  const qrPayload =
    booking.rawQrToken ||
    JSON.stringify({
      bookingNumber: booking.bookingNumber,
      id: booking.id,
      stationId: booking.stationId,
      vehicleId: booking.vehicleId,
      status: booking.status,
    })

  const rescheduleCount = booking.rescheduleCount ?? 0
  const isMaxReschedulesReached = rescheduleCount >= 2

  const totalPrice = booking.pricingSnapshot?.totalPrice ?? 0
  const basePrice = booking.pricingSnapshot?.basePrice ?? 0
  const extraPrice = booking.pricingSnapshot?.extraPrice ?? 0
  const paymentMethodStr = booking.paymentMethod
    ? booking.paymentMethod.replace("_", " ")
    : "ONLINE"
  const paymentStatusStr = booking.paymentStatus || "PENDING"
  const bookingStatusStr = booking.status ? booking.status.replace("_", " ") : "PENDING"

  const durationBreakdown = booking.serviceDurationBreakdown || {
    baseMinutes: booking.serviceType === "FULL" ? 40 : 20,
    extraServicesMinutes: (booking.extraServices?.length || 0) * 5,
    vehicleClassModifierMinutes: 0,
    totalEstimatedMinutes:
      (booking.serviceType === "FULL" ? 40 : 20) + (booking.extraServices?.length || 0) * 5,
  }
  const estimatedWashDuration =
    booking.estimatedServiceDurationMinutes || durationBreakdown.totalEstimatedMinutes

  const nowMs = Date.now()
  const serviceStartMs = booking.serviceStartedAt
    ? new Date(booking.serviceStartedAt).getTime()
    : booking.checkedInAt
      ? new Date(booking.checkedInAt).getTime()
      : null

  const elapsedServiceMinutes = serviceStartMs
    ? Math.max(0, Math.floor((nowMs - serviceStartMs) / (1000 * 60)))
    : 0

  const remainingServiceMinutes = Math.max(1, estimatedWashDuration - elapsedServiceMinutes)

  const canReschedule = Boolean(
    (booking.status === "CONFIRMED" || booking.status === "PENDING") &&
    !booking.isWalkIn &&
    !isMaxReschedulesReached &&
    booking.scheduling?.windowStart &&
    new Date(booking.scheduling.windowStart).getTime() - Date.now() >= 24 * 60 * 60 * 1000
  )

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {vehicleName}
          </h1>
          <span className="font-mono text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
            #{booking.bookingNumber}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your booking schedules, track live bay queue progress, and access check-in QR
          passes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      booking.status === "COMPLETED"
                        ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                        : booking.status === "IN_SERVICE" || booking.status === "CHECKED_IN"
                          ? "bg-blue-500/15 text-blue-500 border border-blue-500/30 animate-pulse"
                          : booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                            ? "bg-destructive/15 text-destructive border border-destructive/30"
                            : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span>{bookingStatusStr}</span>
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formattedDates.dateStr}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {stationName}
                </h2>
                <p className="text-xs text-primary font-medium flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>Slot Window: {formattedDates.timeStr}</span>
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1 bg-muted/40 p-4 rounded-2xl border border-border sm:border-0 sm:p-0 sm:bg-transparent">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block">
                  Total Amount
                </span>
                <span className="text-2xl sm:text-3xl font-black text-foreground font-sans">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
                <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                  ✓ {paymentStatusStr} via {paymentMethodStr}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <span>Service Progress</span>
                <span className="text-primary font-semibold">
                  {currentStageIndex >= 0
                    ? `${(currentStageIndex + 1) * 20}% Completed`
                    : "Cancelled"}
                </span>
              </div>

              <div className="relative flex justify-between items-center z-10 px-2">
                <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-muted -z-10 rounded-full" />
                <div
                  className="absolute top-1/2 left-4 h-1 -translate-y-1/2 bg-gradient-to-r from-primary to-emerald-400 -z-10 rounded-full transition-all duration-500"
                  style={{
                    width:
                      currentStageIndex < 0
                        ? "0%"
                        : `${(currentStageIndex / (stages.length - 1)) * 100}%`,
                  }}
                />

                {stages.map((stg, idx) => {
                  const isPassed = currentStageIndex >= idx
                  const isCurrent = currentStageIndex === idx
                  return (
                    <div key={stg.id} className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                          isCurrent
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110"
                            : isPassed
                              ? "bg-emerald-500 text-primary-foreground font-black"
                              : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {isPassed ? <CheckCircle2 size={18} /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isCurrent
                            ? "text-primary"
                            : isPassed
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {stg.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border">
              <div className="flex flex-wrap items-center gap-3">
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
                {isDownloading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Download size={15} />
                )}
                <span>{isDownloading ? "Downloading..." : "Download Invoice"}</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-6 text-left relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Clock size={16} />
                  <span>Estimated Wash Time</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                  <span>~{estimatedWashDuration} Mins</span>
                  <span className="text-xs font-semibold text-muted-foreground font-sans bg-muted px-3 py-1 rounded-full border border-border">
                    {serviceName}
                  </span>
                </h3>
              </div>

              {booking.status === "IN_SERVICE" ? (
                <div className="px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-500 text-xs font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                  <span>Wash In Progress (~{remainingServiceMinutes} mins remaining)</span>
                </div>
              ) : booking.status === "CHECKED_IN" ? (
                <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Checked In · Bay Assignment in Queue</span>
                </div>
              ) : booking.status === "COMPLETED" ? (
                <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Service Completed Cleanly</span>
                </div>
              ) : booking.status === "CANCELLED" || booking.status === "NO_SHOW" ? (
                <div className="px-4 py-2 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold flex items-center gap-2">
                  <XCircle size={16} />
                  <span>
                    {booking.status === "CANCELLED" ? "Booking Cancelled" : "Slot Expired"}
                  </span>
                </div>
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-2">
                  <Clock size={14} />
                  <span>Estimated Slot Execution</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  Base Wash Duration
                </span>
                <span className="text-sm sm:text-base font-bold text-foreground">
                  {durationBreakdown.baseMinutes} mins
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {booking.serviceType === "FULL" ? "Comprehensive wash" : "Express quick wash"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  Add-On Treatments
                </span>
                <span className="text-sm sm:text-base font-bold text-foreground">
                  +{durationBreakdown.extraServicesMinutes} mins
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {booking.extraServices?.length || 0} extra service
                  {booking.extraServices?.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  Vehicle Class Modifier
                </span>
                <span className="text-sm sm:text-base font-bold text-foreground">
                  {durationBreakdown.vehicleClassModifierMinutes > 0
                    ? `+${durationBreakdown.vehicleClassModifierMinutes} mins`
                    : "Standard (+0 min)"}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {booking.vehicleDetails?.model || "Standard vehicle profile"}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3.5 text-xs text-muted-foreground leading-relaxed">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                <Info size={16} />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-foreground text-xs sm:text-sm">
                    How Queue Waiting Time Works
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 font-bold">
                    Arrival &amp; Check-In Based
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] sm:text-xs">
                  Your booking secures your service slot window (
                  <strong>{formattedDates.timeStr}</strong>). Once you arrive at the station and
                  complete check-in (via QR scan / pre-inspection), your vehicle is entered into the
                  live operational queue. The dynamic waiting time is calculated in real time based
                  on active bay availability and vehicles ahead in line.
                </p>
              </div>
            </div>
          </div>

          {(booking.preServiceInspection || booking.postServiceInspection) && (
            <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-6 text-left">
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <Camera size={18} className="text-primary" />
                <h3 className="text-lg font-bold text-foreground">Vehicle Inspection Reports</h3>
              </div>

              {booking.preServiceInspection && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                    Pre-Service Inspection
                  </span>
                  {booking.preServiceInspection.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {booking.preServiceInspection.photos.map((photo, idx) => (
                        <a
                          key={idx}
                          href={photo.secured_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
                        >
                          <img
                            src={photo.secured_url}
                            alt={`Pre-inspection angle ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                    <p className="text-xs italic text-muted-foreground leading-relaxed">
                      "{booking.preServiceInspection.notes || "No additional notes recorded"}"
                    </p>
                    <span className="text-[10px] text-muted-foreground block pt-1">
                      Verified {new Date(booking.preServiceInspection.capturedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {booking.postServiceInspection && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                    Post-Service Quality Inspection
                  </span>
                  {booking.postServiceInspection.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {booking.postServiceInspection.photos.map((photo, idx) => (
                        <a
                          key={idx}
                          href={photo.secured_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
                        >
                          <img
                            src={photo.secured_url}
                            alt={`Post-inspection angle ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {booking.postServiceInspection.checklist &&
                    booking.postServiceInspection.checklist.length > 0 && (
                      <div className="space-y-1.5">
                        {booking.postServiceInspection.checklist.map((item) => (
                          <div
                            key={item.key}
                            className="p-3 rounded-xl border border-border bg-muted/40 space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-2 text-xs font-semibold text-foreground truncate">
                                <ClipboardCheck size={13} className="text-primary shrink-0" />
                                {item.label}
                              </span>
                              <span
                                className={`shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                  item.passed
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                    : "bg-destructive/10 text-destructive border border-destructive/20"
                                }`}
                              >
                                {item.passed ? "Passed" : "Issue Flagged"}
                              </span>
                            </div>
                            {item.remark && (
                              <p className="text-[11px] text-muted-foreground italic pl-5">
                                "{item.remark}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                    <p className="text-xs italic text-muted-foreground leading-relaxed">
                      "{booking.postServiceInspection.notes || "No additional notes recorded"}"
                    </p>
                    <span className="text-[10px] text-muted-foreground block pt-1">
                      Handed over{" "}
                      {new Date(booking.postServiceInspection.capturedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-6 text-left">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <ShieldCheck size={18} className="text-primary" />
              <h3 className="text-lg font-bold text-foreground">Booking Specifications</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                  Service Tier
                </span>
                <h4 className="text-base font-bold text-foreground">{serviceName}</h4>
                <p className="text-xs text-muted-foreground">
                  Precision wash &amp; surface treatment
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                  Add-Ons Included ({booking.extraServices?.length || 0})
                </span>
                {booking.extraServices && booking.extraServices.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {booking.extraServices.map((es, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-muted border border-border text-[11px] font-semibold text-foreground"
                      >
                        {es.name} (+₹{es.price})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground font-medium">
                    No extra add-ons selected.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                  Payment Method
                </span>
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <CreditCard size={16} className="text-primary" />
                  <span>{paymentMethodStr}</span>
                </div>
                <p className="text-xs text-emerald-500 font-medium">✓ {paymentStatusStr}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                  Time Window
                </span>
                <p className="text-sm font-bold text-foreground">{formattedDates.timeStr}</p>
                <p className="text-xs text-muted-foreground">{formattedDates.dateStr}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-4 text-left">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-4">
              Payment Summary Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>{serviceName} (Base)</span>
                <span className="font-bold text-foreground">
                  ₹{basePrice.toLocaleString("en-IN")}
                </span>
              </div>

              {extraPrice > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Extra Add-ons Total</span>
                  <span className="font-bold text-foreground">
                    +₹{extraPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Platform Booking Fee</span>
                <span className="font-bold text-foreground">₹0</span>
              </div>

              <div className="flex justify-between text-sm font-black text-foreground pt-3 border-t border-border">
                <span>Total Amount Paid</span>
                <span className="text-primary font-sans text-base">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <QRCodePass
            value={qrPayload}
            bookingNumber={booking.bookingNumber}
            stationName={stationName}
            stationCity={stationLocation}
            vehicleName={vehicleName}
            plateNumber={plateNumber}
            serviceName={serviceName}
            scheduledDate={formattedDates.dateStr}
            scheduledTime={formattedDates.timeStr}
            totalPrice={totalPrice}
            paymentStatus={paymentStatusStr}
          />

          <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-4 text-left">
            <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">
              Vehicle Information
            </h3>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary shrink-0">
                <Car size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-foreground">{vehicleName}</h4>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-muted text-[11px] font-mono font-bold text-muted-foreground">
                    {plateNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>

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

              <button
                type="button"
                onClick={() => toast.info("Support ticket module will open here.")}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
