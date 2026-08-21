import {
  AlertTriangle,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Droplets,
  Play,
  Sparkles,
  Wrench,
} from "lucide-react"
import type { BookingResponse } from "@/shared/apis/booking.api"

interface ActiveSessionPanelProps {
  selectedBooking: BookingResponse | null
  selectedVehicleImage: string | null
  isAdvancing: boolean
  formattedSessionTimer: string
  onAdvanceStatus: (targetStatus: string) => void
  onStallClick: (bookingId: string) => void
  onResolveStalledClick: (bookingId: string) => void
  onGoToPostInspection: (bookingId: string) => void
}

export function ActiveSessionPanel({
  selectedBooking,
  selectedVehicleImage,
  isAdvancing,
  formattedSessionTimer,
  onAdvanceStatus,
  onStallClick,
  onResolveStalledClick,
  onGoToPostInspection,
}: ActiveSessionPanelProps) {
  return (
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
                onClick={() => onStallClick(selectedBooking.id)}
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
          <div className="p-8 sm:p-16 my-auto text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
              <Sparkles className="h-10 w-10 animate-pulse" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-lg font-bold text-foreground">
                Select a Vehicle from the Queue
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click any vehicle in the live queue on the left to control the wash session,
                inspect photos, or complete handover.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
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

            <div className="pt-3">
              <div className="p-4 rounded-2xl bg-muted/40 border-l-4 border-primary space-y-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">
                  SERVICE DETAILS
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 text-primary text-xs font-bold">
                    <Droplets className="h-3.5 w-3.5" />
                    {selectedBooking.serviceType === "FULL"
                      ? "Full Premium Wash"
                      : "Express Half Wash"}
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

            <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
              {selectedBooking.status === "STALLED" ? (
                <button
                  type="button"
                  onClick={() => onResolveStalledClick(selectedBooking.id)}
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
                  onClick={() => onAdvanceStatus("COMPLETED")}
                  disabled={isAdvancing}
                  className="col-span-2 py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wide hover:bg-emerald-500 transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 shadow-md"
                >
                  <CheckCircle2 className="h-4 w-4" /> Handover Vehicle &amp; Close Booking
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onAdvanceStatus("IN_SERVICE")}
                    disabled={isAdvancing || selectedBooking.status !== "CHECKED_IN"}
                    className="py-3.5 rounded-xl bg-muted text-muted-foreground font-extrabold text-xs uppercase tracking-wide hover:bg-muted/70 transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4 fill-current" /> Start Service
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedBooking.status === "IN_SERVICE") {
                        onGoToPostInspection(selectedBooking.id)
                      } else {
                        onAdvanceStatus("COMPLETED")
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
  )
}
