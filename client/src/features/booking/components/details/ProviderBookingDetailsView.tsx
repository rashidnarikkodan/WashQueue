import { useMemo, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Clock,
  XCircle,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
  Lock,
  FileText,
} from "lucide-react"
import type { BookingResponse } from "@/shared/apis/booking.api"
import { toast } from "sonner"

interface ProviderBookingDetailsViewProps {
  booking: BookingResponse
  formattedDates: { dateStr: string; timeStr: string }
  currentStageIndex: number
  onOpenCancelModal: () => void
  onAdvanceStatus: (targetStatus: string) => Promise<void>
  isAdvancingStatus: boolean
}

export default function ProviderBookingDetailsView({
  booking,
  formattedDates,
  onOpenCancelModal,
  onAdvanceStatus,
  isAdvancingStatus,
}: ProviderBookingDetailsViewProps) {
  const navigate = useNavigate()

  const customerName =
    booking.customerDetails?.name ||
    booking.walkInCustomer?.name ||
    (booking.isWalkIn ? "Walk-In Customer" : "Customer")
  const customerPhone = booking.customerDetails?.phone || booking.walkInCustomer?.phone || "N/A"
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

  const customerInitials = useMemo(() => {
    if (!customerName) return "CU"
    const parts = customerName.trim().split(" ")
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    return customerName.slice(0, 2).toUpperCase()
  }, [customerName])

  const customerBadge = useMemo(() => {
    if (booking.isWalkIn || booking.walkInCustomer) return "WALK-IN GUEST"
    return "REGISTERED USER"
  }, [booking.isWalkIn, booking.walkInCustomer])

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)

  const isServiceStarted = Boolean(
    booking.serviceStartedAt ||
    booking.checkedInAt ||
    booking.status === "IN_SERVICE" ||
    booking.status === "SERVICE_COMPLETED" ||
    booking.status === "AWAITING_HANDOVER" ||
    booking.status === "COMPLETED"
  )

  useEffect(() => {
    if (!isServiceStarted || booking.status === "CANCELLED" || booking.status === "NO_SHOW") {
      setElapsedSeconds(0)
      return
    }

    const startTimeStr = booking.serviceStartedAt || booking.checkedInAt
    if (!startTimeStr) return

    const startTime = new Date(startTimeStr).getTime()

    const updateTimer = () => {
      if (booking.completedAt || booking.status === "COMPLETED") {
        const endTime = booking.completedAt
          ? new Date(booking.completedAt).getTime()
          : new Date(booking.updatedAt).getTime()
        setElapsedSeconds(Math.max(0, Math.floor((endTime - startTime) / 1000)))
        return
      }
      const now = Date.now()
      setElapsedSeconds(Math.max(0, Math.floor((now - startTime) / 1000)))
    }

    const interval = setInterval(updateTimer, 1000)
    void Promise.resolve().then(updateTimer)
    return () => clearInterval(interval)
  }, [
    isServiceStarted,
    booking.serviceStartedAt,
    booking.checkedInAt,
    booking.completedAt,
    booking.status,
    booking.updatedAt,
  ])

  const formattedTimer = useMemo(() => {
    const hrs = Math.floor(elapsedSeconds / 3600)
    const mins = Math.floor((elapsedSeconds % 3600) / 60)
    const secs = elapsedSeconds % 60
    const pad = (n: number) => n.toString().padStart(2, "0")
    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
    return `${pad(mins)}:${pad(secs)}`
  }, [elapsedSeconds])

  const timelineSteps = useMemo(() => {
    const historyMap = new Map<string, string>()
    if (booking.statusHistory) {
      booking.statusHistory.forEach((log) => {
        const timeStr = new Date(log.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        historyMap.set(log.toStatus, timeStr)
      })
    }

    const stages = [
      { key: "CONFIRMED", label: "Confirmed" },
      { key: "CHECKED_IN", label: "Checked-In" },
      { key: "IN_SERVICE", label: "Washing" },
      { key: "SERVICE_COMPLETED", label: "Ready" },
      { key: "COMPLETED", label: "Completed" },
    ]

    const currentStatus = booking.status
    const isCancelled = currentStatus === "CANCELLED"
    const isNoShow = currentStatus === "NO_SHOW"

    const order = [
      "PENDING",
      "CONFIRMED",
      "CHECKED_IN",
      "IN_SERVICE",
      "SERVICE_COMPLETED",
      "AWAITING_HANDOVER",
      "COMPLETED",
    ]
    const currentIdx = order.indexOf(currentStatus)

    return stages.map((stg) => {
      const recordedTime = historyMap.get(stg.key)
      const stageIdx = order.indexOf(stg.key)
      const active = currentStatus === stg.key
      const done = recordedTime
        ? true
        : currentIdx >= stageIdx && currentIdx !== -1 && !isCancelled && !isNoShow

      return {
        label: stg.label,
        time:
          isCancelled && !recordedTime
            ? "Cancelled"
            : isNoShow && !recordedTime
              ? "No-Show"
              : recordedTime || (active ? "In Progress" : done ? "Done" : "Pending"),
        done,
        active,
        isCancelled: isCancelled && !recordedTime,
      }
    })
  }, [booking.statusHistory, booking.status])

  const inspectionLog = useMemo(() => {
    if (!booking.statusHistory) return null
    return booking.statusHistory.find(
      (l) => l.notes && (l.toStatus === "IN_SERVICE" || l.toStatus === "CHECKED_IN")
    )
  }, [booking.statusHistory])

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Booking Details Overview
          </h1>
          <p className="text-xs text-muted-foreground">
            Station bay queue monitoring, customer verification, and live service workflow controls
          </p>
        </div>

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

          {booking.status === "CHECKED_IN" && (
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

          {booking.status === "IN_SERVICE" && (
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
            onClick={() => window.print()}
            className="p-2.5 rounded-full bg-card border border-border text-foreground hover:bg-muted transition-all cursor-pointer"
            title="Print Summary"
          >
            <Printer size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl grid grid-cols-1 sm:grid-cols-4 gap-6 text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">
                Booking ID
              </span>
              <span className="text-lg font-mono font-bold text-primary">
                #{booking.bookingNumber}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">
                Current Status
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    booking.status === "COMPLETED"
                      ? "bg-emerald-500 shadow-xs shadow-emerald-500"
                      : booking.status === "IN_SERVICE" || booking.status === "CHECKED_IN"
                        ? "bg-blue-500 animate-pulse shadow-xs shadow-blue-500"
                        : booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                          ? "bg-destructive shadow-xs shadow-destructive"
                          : "bg-amber-500 shadow-xs shadow-amber-500"
                  }`}
                />
                <span
                  className={`text-base font-bold uppercase ${
                    booking.status === "COMPLETED"
                      ? "text-emerald-500"
                      : booking.status === "IN_SERVICE" || booking.status === "CHECKED_IN"
                        ? "text-blue-500"
                        : booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                          ? "text-destructive"
                          : "text-amber-500"
                  }`}
                >
                  {booking.status.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">
                Scheduled Slot
              </span>
              <span className="text-xs font-bold text-foreground block truncate">
                {formattedDates.timeStr}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {formattedDates.dateStr}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">
                Service Type
              </span>
              <span className="text-sm font-bold text-foreground block">{serviceName}</span>
              <span className="text-[10px] text-muted-foreground">
                {booking.vehicleDetails?.brand
                  ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model || ""}`.trim()
                  : booking.walkInVehicle?.registrationNumber
                    ? `Plate: ${booking.walkInVehicle.registrationNumber}`
                    : "Standard Wash"}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                <h3 className="text-base font-bold text-foreground">Live Execution Timeline</h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
              >
                {booking.status === "CANCELLED"
                  ? "TERMINATED"
                  : booking.status === "NO_SHOW"
                    ? "EXPIRED"
                    : "REAL-TIME"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                      step.isCancelled
                        ? "bg-muted border border-destructive/20 text-destructive/50"
                        : step.active
                          ? "bg-card border-4 border-primary text-primary scale-110 shadow-primary/30"
                          : step.done
                            ? "bg-primary text-primary-foreground font-black"
                            : "bg-muted border border-border text-muted-foreground"
                    }`}
                  >
                    {step.done ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <span
                      className={`text-xs font-bold block ${
                        step.isCancelled ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span
                      className={`text-[10px] block ${
                        step.isCancelled ? "text-destructive/70" : "text-muted-foreground"
                      }`}
                    >
                      {step.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground">Pre-Service Inspection</h3>
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                  booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                    ? "bg-muted text-muted-foreground border border-border"
                    : booking.status === "IN_SERVICE" ||
                        booking.status === "SERVICE_COMPLETED" ||
                        booking.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                }`}
              >
                {booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                  ? "NOT APPLICABLE"
                  : booking.status === "IN_SERVICE" ||
                      booking.status === "SERVICE_COMPLETED" ||
                      booking.status === "COMPLETED"
                    ? "CONDUCTED"
                    : "PENDING"}
              </span>
            </div>

            {booking.preServiceInspection ? (
              <div className="space-y-4">
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
                <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">
                    INSPECTION FINDINGS &amp; NOTES
                  </span>
                  <p className="text-xs italic text-foreground leading-relaxed">
                    "{booking.preServiceInspection.notes || "No additional notes recorded"}"
                  </p>
                  <span className="text-[10px] text-muted-foreground block pt-1">
                    Captured {new Date(booking.preServiceInspection.capturedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : inspectionLog?.notes ? (
              <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">
                  INSPECTION FINDINGS &amp; NOTES
                </span>
                <p className="text-xs italic text-foreground leading-relaxed">
                  "{inspectionLog.notes}"
                </p>
              </div>
            ) : booking.status === "CANCELLED" || booking.status === "NO_SHOW" ? (
              <div className="p-4 rounded-xl border border-border bg-muted/40">
                <p className="text-xs text-muted-foreground">
                  Wash booking was cancelled before service was initiated. Pre-inspection was not
                  required.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-border bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  {booking.status === "IN_SERVICE" || booking.status === "COMPLETED"
                    ? "Vehicle received and checked in at station."
                    : "Pre-service inspection can be logged prior to starting the wash service."}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/manager/bookings/${booking.id}/pre-inspection`)}
                  className="px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <FileText size={14} />
                  <span>Log Pre-Inspection</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground">
                Post-Service Quality Inspection
              </h3>
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                  booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                    ? "bg-muted text-muted-foreground border border-border"
                    : booking.status === "COMPLETED" || booking.status === "SERVICE_COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                  ? "NOT APPLICABLE"
                  : booking.status === "COMPLETED"
                    ? "COMPLETED"
                    : booking.status === "SERVICE_COMPLETED"
                      ? "READY FOR HANDOVER"
                      : "LOCKED"}
              </span>
            </div>

            {booking.postServiceInspection ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      booking.postServiceInspection.checklist?.every((c) => c.passed) !== false
                        ? "text-emerald-500"
                        : "text-amber-500"
                    }`}
                  >
                    {booking.postServiceInspection.checklist?.every((c) => c.passed) !== false
                      ? "✓ Quality Assurance Passed"
                      : "⚠ Quality Assurance — Issues Flagged"}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/manager/bookings/${booking.id}/post-inspection`)}
                    className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-xs font-bold hover:bg-muted cursor-pointer"
                  >
                    View Post-Inspection
                  </button>
                </div>

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
                          className="p-3 rounded-lg border border-border bg-muted/40 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-foreground truncate">
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
                            <p className="text-[11px] text-muted-foreground italic">
                              "{item.remark}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">
                    HANDOVER NOTES
                  </span>
                  <p className="text-xs italic text-foreground leading-relaxed">
                    "{booking.postServiceInspection.notes || "No additional notes recorded"}"
                  </p>
                  <span className="text-[10px] text-muted-foreground block pt-1">
                    Captured {new Date(booking.postServiceInspection.capturedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground flex items-center gap-3">
                <Lock size={16} className="shrink-0 text-muted-foreground/60" />
                <span>
                  {booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                    ? "Service cancelled; post-wash quality inspection is not applicable."
                    : "Post-service quality check unlocks once washing is completed by the manager or technician."}
                </span>
              </div>
            )}
          </div>

          {(booking.status === "CANCELLED" ||
            booking.cancellation ||
            (booking.statusHistory && booking.statusHistory.some((l) => l.reason || l.notes))) && (
            <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-4 text-left">
              <div className="flex items-center gap-2 text-amber-500 border-b border-border pb-3">
                <AlertTriangle size={20} />
                <h3 className="text-base font-bold text-foreground">Status Log &amp; Exceptions</h3>
              </div>

              {booking.status === "CANCELLED" && (
                <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/10 space-y-1">
                  <h4 className="text-sm font-bold text-destructive">Booking Cancelled</h4>
                  <p className="text-xs text-foreground leading-relaxed">
                    Reason:{" "}
                    {booking.cancellation?.cancellationReason || "No cancellation reason provided."}
                  </p>
                  {booking.cancellation?.cancelledAt && (
                    <span className="text-[10px] text-muted-foreground font-mono block pt-1">
                      Cancelled at {new Date(booking.cancellation.cancelledAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {booking.statusHistory &&
                booking.statusHistory.filter((l) => l.reason || l.notes).length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">
                      Recorded Log Notes
                    </span>
                    {booking.statusHistory
                      .filter((l) => l.reason || l.notes)
                      .map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl border border-border bg-muted/40 text-xs space-y-0.5"
                        >
                          <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                            <span className="font-bold text-foreground">
                              Status: {log.toStatus ? log.toStatus.replace("_", " ") : "UPDATED"}
                            </span>
                            <span>
                              {new Date(log.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {log.reason && <p className="text-amber-500 font-medium">{log.reason}</p>}
                          {log.notes && <p className="text-muted-foreground italic">{log.notes}</p>}
                        </div>
                      ))}
                  </div>
                )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-6 text-left">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-xl flex items-center justify-center shrink-0">
                {customerInitials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-foreground">{customerName}</h4>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-500">
                    {customerBadge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{customerPhone}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-muted/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-muted-foreground block">
                    VEHICLE
                  </span>
                  <h5 className="text-sm font-bold text-foreground">{vehicleName}</h5>
                  <p className="text-[11px] text-muted-foreground">
                    {booking.vehicleDetails?.brand
                      ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model || ""}`.trim()
                      : booking.walkInVehicle?.registrationNumber
                        ? `Walk-In Entry`
                        : "Vehicle Information"}
                  </p>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-muted text-foreground font-bold border border-border">
                  {plateNumber}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase text-muted-foreground block">
                  SCHEDULED AT
                </span>
                <span className="text-xs font-bold text-foreground block">
                  {formattedDates.dateStr}
                </span>
                <span className="text-[11px] text-muted-foreground">{formattedDates.timeStr}</span>
              </div>

              <div className="space-y-0.5 text-right">
                <span className="text-[9px] font-black uppercase text-muted-foreground block">
                  EXECUTION TYPE
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                  STATION
                </span>
              </div>
            </div>

            {isServiceStarted && booking.status !== "CANCELLED" && booking.status !== "NO_SHOW" ? (
              <div className="p-5 rounded-2xl border border-primary/20 bg-muted/40 text-center space-y-1">
                <span className="text-[9px] font-black uppercase text-muted-foreground block tracking-widest">
                  {booking.completedAt || booking.status === "COMPLETED"
                    ? "TOTAL SERVICE DURATION"
                    : "LIVE SERVICE ELAPSED TIME"}
                </span>
                <div className="flex items-center justify-center gap-2 text-primary font-mono text-3xl font-bold">
                  {(booking.status === "IN_SERVICE" || booking.status === "CHECKED_IN") && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  )}
                  <span>{formattedTimer}</span>
                </div>
              </div>
            ) : booking.status === "CANCELLED" ? (
              <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-destructive">
                    Booking Cancelled
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-destructive/20 text-destructive">
                    Inactive
                  </span>
                </div>
                <p className="text-xs text-foreground">
                  {booking.cancellation?.cancellationReason ||
                    "Cancelled by customer before service."}
                </p>
                {booking.cancellation?.cancelledAt && (
                  <span className="text-[10px] text-muted-foreground font-mono block">
                    Cancelled:{" "}
                    {new Date(booking.cancellation.cancelledAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            ) : booking.status === "NO_SHOW" ? (
              <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-1 text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-destructive block">
                  Customer No-Show
                </span>
                <p className="text-xs text-muted-foreground">
                  The vehicle was not presented during the scheduled slot window.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                    Awaiting Arrival
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-500">
                    Upcoming
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Vehicle scheduled for {formattedDates.timeStr}. Check-in will start execution
                  tracking.
                </p>
              </div>
            )}
          </div>

          <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-4 text-left">
            <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest border-b border-border pb-3">
              FINANCIAL SUMMARY
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Base Service Fee ({serviceName})</span>
                <span className="font-bold text-foreground">
                  ₹{(booking.pricingSnapshot?.basePrice ?? 0).toLocaleString("en-IN")}
                </span>
              </div>

              {booking.extraServices && booking.extraServices.length > 0 ? (
                booking.extraServices.map((es, idx) => (
                  <div key={idx} className="flex justify-between text-muted-foreground">
                    <span>{es.name}</span>
                    <span className="font-bold text-foreground">
                      +₹{es.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-muted-foreground">
                  <span>Extra Add-ons</span>
                  <span className="font-bold text-foreground">₹0</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-border">
                <div>
                  <span className="text-[9px] font-black uppercase text-muted-foreground block">
                    TOTAL AMOUNT
                  </span>
                  <span className="text-2xl font-extrabold text-foreground font-sans">
                    ₹{(booking.pricingSnapshot?.totalPrice ?? 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                    booking.status === "CANCELLED"
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                  }`}
                >
                  {booking.status === "CANCELLED" ? "REFUNDED" : booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-3">
            {booking.status === "IN_SERVICE" && (
              <button
                type="button"
                onClick={() => onAdvanceStatus("COMPLETED")}
                disabled={isAdvancingStatus}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20"
              >
                MARK SERVICE COMPLETE
              </button>
            )}

            {booking.status === "CHECKED_IN" && (
              <button
                type="button"
                onClick={() => onAdvanceStatus("IN_SERVICE")}
                disabled={isAdvancingStatus}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20"
              >
                START SERVICE
              </button>
            )}

            {booking.status === "SERVICE_COMPLETED" && (
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
                onClick={() => navigate("/manager/check-in")}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20"
              >
                CHECK-IN VEHICLE
              </button>
            )}

            {(booking.status === "CONFIRMED" ||
              booking.status === "PENDING" ||
              booking.status === "CHECKED_IN") && (
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
        </div>
      </div>
    </div>
  )
}
