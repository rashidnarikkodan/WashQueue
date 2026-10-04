import { useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Clock, FileText } from "lucide-react"
import type { BookingResponse } from "@/shared/apis/booking.api"
import QRCodePass from "@/shared/components/ui/QRCodePass"
import { BookingReviewCard } from "@/features/review/components/BookingReviewCard"

import BookingStatusTracker from "./BookingStatusTracker"
import ServiceDurationTimerCard from "./ServiceDurationTimerCard"
import BookingPaymentSummaryCard from "./BookingPaymentSummaryCard"
import BookingSpecificationsCard from "./BookingSpecificationsCard"
import BookingActivityHistoryCard from "./BookingActivityHistoryCard"
import CustomerVehicleProfileCard from "./CustomerVehicleProfileCard"
import InspectionReportCard from "./InspectionReportCard"
import {
  CustomerActionHeaderButtons,
  CustomerSupportSidebarWidget,
} from "./actions/CustomerBookingActions"
import { StaffHeaderActions, StaffSidebarWorkflowPanel } from "./actions/StaffBookingActions"
import {
  getServiceDisplayName,
  getStationDisplayName,
  getVehicleDisplayName,
  getVehiclePlateNumber,
} from "../../utils/booking-display.utils"
import type { RoleType } from "@/shared/constants/role.const"

export interface UnifiedBookingDetailsViewProps {
  booking: BookingResponse
  formattedDates: { dateStr: string; timeStr: string }
  currentStageIndex: number
  stages?: Array<{ id: string; label: string }>
  onOpenCancelModal: () => void
  onOpenRescheduleModal?: () => void
  onAdvanceStatus?: (targetStatus: string) => Promise<void>
  isAdvancingStatus?: boolean
  basePath?: string
  userRole?: RoleType | "CUSTOMER" | "MANAGER" | "OWNER" | "ADMIN"
}

export default function UnifiedBookingDetailsView({
  booking,
  formattedDates,
  currentStageIndex,
  stages,
  onOpenCancelModal,
  onOpenRescheduleModal,
  onAdvanceStatus,
  isAdvancingStatus = false,
  basePath,
  userRole = "customer",
}: UnifiedBookingDetailsViewProps) {
  const navigate = useNavigate()
  const normalizedRole = userRole.toLowerCase()
  const isCustomer = normalizedRole === "customer"
  const navBasePath = basePath || (isCustomer ? "" : "/manager/bookings")

  const vehicleName = getVehicleDisplayName(booking)
  const plateNumber = getVehiclePlateNumber(booking)
  const serviceName = getServiceDisplayName(booking)
  const stationName = getStationDisplayName(booking)
  const stationLocation = booking.stationDetails?.city || ""

  const totalPrice = booking.pricingSnapshot?.totalPrice ?? 0
  const paymentMethodStr = booking.paymentMethod
    ? booking.paymentMethod.replace("_", " ")
    : "ONLINE"
  const paymentStatusStr = booking.paymentStatus || "PENDING"
  const bookingStatusStr = booking.status ? booking.status.replace("_", " ") : "PENDING"

  const qrPayload = useMemo(
    () =>
      booking.rawQrToken ||
      JSON.stringify({
        bookingNumber: booking.bookingNumber,
        id: booking.id,
        stationId: booking.stationId,
        vehicleId: booking.vehicleId,
        status: booking.status,
      }),
    [booking]
  )

  const inspectionLog = useMemo(() => {
    if (!booking.statusHistory) return null
    return booking.statusHistory.find(
      (l) => l.notes && (l.toStatus === "IN_SERVICE" || l.toStatus === "CHECKED_IN")
    )
  }, [booking.statusHistory])

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      {/* Top Header */}
      {isCustomer ? (
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
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Booking Details Overview
            </h1>
            <p className="text-xs text-muted-foreground">
              Station bay queue monitoring, customer verification, and live service workflow
              controls
            </p>
          </div>

          <StaffHeaderActions
            booking={booking}
            onOpenCancelModal={onOpenCancelModal}
            onAdvanceStatus={onAdvanceStatus}
            isAdvancingStatus={isAdvancingStatus}
          />
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Card */}
          {isCustomer ? (
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

                  <Link to={`/stations/${booking.stationId}`}>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight hover:text-primary">
                      {stationName}
                    </h2>
                  </Link>
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

              {/* Status Stepper */}
              <BookingStatusTracker
                booking={booking}
                variant="stepper"
                currentStageIndex={currentStageIndex}
                stages={stages}
              />

              {/* Customer Actions */}
              <CustomerActionHeaderButtons
                booking={booking}
                formattedDates={formattedDates}
                onOpenCancelModal={onOpenCancelModal}
                onOpenRescheduleModal={onOpenRescheduleModal}
              />
            </div>
          ) : (
            <>
              {/* Staff Overview Grid */}
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
                  <span className="text-[10px] text-muted-foreground truncate block">
                    {booking.vehicleDetails?.brand
                      ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model || ""}`.trim()
                      : plateNumber !== "N/A"
                        ? `Plate: ${plateNumber}`
                        : "Standard Wash"}
                  </span>
                </div>
              </div>

              {/* Staff Timeline */}
              <BookingStatusTracker
                booking={booking}
                variant="timeline"
                currentStageIndex={currentStageIndex}
              />
            </>
          )}

          {/* Service Duration Timer (Customer View) */}
          {isCustomer && <ServiceDurationTimerCard booking={booking} mode="countdown" />}

          {/* Pre-Service Inspection Card */}
          {(booking.preServiceInspection || inspectionLog?.notes || !isCustomer) && (
            <InspectionReportCard
              title="Pre-Service Inspection"
              type="PRE"
              inspection={
                booking.preServiceInspection
                  ? {
                      inspectorName: "Station Inspector",
                      inspectedAt: booking.preServiceInspection.capturedAt,
                      notes: booking.preServiceInspection.notes,
                      photos: booking.preServiceInspection.photos,
                    }
                  : inspectionLog?.notes
                    ? { notes: inspectionLog.notes }
                    : null
              }
              statusBadgeText={
                booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                  ? "NOT APPLICABLE"
                  : booking.status === "IN_SERVICE" ||
                      booking.status === "SERVICE_COMPLETED" ||
                      booking.status === "COMPLETED"
                    ? "CONDUCTED"
                    : "PENDING"
              }
              statusBadgeClass={
                booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                  ? "bg-muted text-muted-foreground border border-border"
                  : booking.status === "IN_SERVICE" ||
                      booking.status === "SERVICE_COMPLETED" ||
                      booking.status === "COMPLETED"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              }
              actionButton={
                !isCustomer && booking.status !== "CANCELLED" && booking.status !== "NO_SHOW" ? (
                  <button
                    type="button"
                    onClick={() => navigate(`${navBasePath}/${booking.id}/pre-inspection`)}
                    className="px-3 py-1.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <FileText size={14} />
                    <span>
                      {booking.preServiceInspection
                        ? "View / Edit Inspection"
                        : "Log Pre-Inspection"}
                    </span>
                  </button>
                ) : undefined
              }
            />
          )}

          {/* Post-Service Inspection Card */}
          {(booking.postServiceInspection || !isCustomer) && (
            <InspectionReportCard
              title="Post-Service Quality Inspection"
              type="POST"
              inspection={
                booking.postServiceInspection
                  ? {
                      inspectorName: "Quality Inspector",
                      inspectedAt: booking.postServiceInspection.capturedAt,
                      notes: booking.postServiceInspection.notes,
                      photos: booking.postServiceInspection.photos,
                      checklist: booking.postServiceInspection.checklist?.map((c) => ({
                        itemId: c.key,
                        label: c.label,
                        passed: c.passed,
                        notes: c.remark,
                      })),
                    }
                  : null
              }
              statusBadgeText={
                booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                  ? "NOT APPLICABLE"
                  : booking.status === "COMPLETED"
                    ? "COMPLETED"
                    : booking.status === "SERVICE_COMPLETED"
                      ? "READY FOR HANDOVER"
                      : "LOCKED"
              }
              statusBadgeClass={
                booking.status === "CANCELLED" || booking.status === "NO_SHOW"
                  ? "bg-muted text-muted-foreground border border-border"
                  : booking.status === "COMPLETED" || booking.status === "SERVICE_COMPLETED"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-muted text-muted-foreground border border-border"
              }
              actionButton={
                !isCustomer &&
                (booking.status === "SERVICE_COMPLETED" ||
                  booking.status === "COMPLETED" ||
                  booking.status === "IN_SERVICE") ? (
                  <button
                    type="button"
                    onClick={() => navigate(`${navBasePath}/${booking.id}/post-inspection`)}
                    className="px-3 py-1.5 rounded-xl bg-card border border-border text-foreground text-xs font-bold hover:bg-muted cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <FileText size={14} />
                    <span>
                      {booking.postServiceInspection
                        ? "View Post-Inspection"
                        : "Log Post-Inspection"}
                    </span>
                  </button>
                ) : undefined
              }
            />
          )}

          {/* Review Card (Customer View) */}
          {isCustomer && (
            <BookingReviewCard
              bookingId={booking.id}
              stationId={booking.stationId}
              stationName={stationName}
              stationImage={booking.stationDetails?.images?.[0]?.url}
              serviceType={serviceName}
              dateTime={`${formattedDates.dateStr} • ${formattedDates.timeStr}`}
              bookingNumber={booking.bookingNumber}
              bookingStatus={booking.status}
            />
          )}

          {/* Specifications & Financial Breakdowns */}
          {isCustomer ? (
            <>
              <BookingSpecificationsCard booking={booking} formattedDates={formattedDates} />
              <BookingPaymentSummaryCard booking={booking} variant="full" />
            </>
          ) : (
            <BookingActivityHistoryCard booking={booking} />
          )}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-4 space-y-6">
          {isCustomer ? (
            <>
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
              <CustomerVehicleProfileCard booking={booking} showCustomerDetails={false} />
              <CustomerSupportSidebarWidget booking={booking} />
            </>
          ) : (
            <>
              <CustomerVehicleProfileCard booking={booking} showCustomerDetails={true} />
              <ServiceDurationTimerCard
                booking={booking}
                mode="elapsed"
                formattedTimeStr={formattedDates.timeStr}
              />
              <BookingPaymentSummaryCard booking={booking} variant="sidebar" />
              <StaffSidebarWorkflowPanel
                booking={booking}
                onAdvanceStatus={onAdvanceStatus}
                isAdvancingStatus={isAdvancingStatus}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
