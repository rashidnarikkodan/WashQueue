import { Car, QrCode } from "lucide-react"
import type { BookingResponse } from "@/shared/apis/booking.api"
import type { FilterCounts, QueueFilter, QueueMetaItem } from "./types"

interface BookingQueuePanelProps {
  isLoading: boolean
  queueList: BookingResponse[]
  filterType: QueueFilter
  filterCounts: FilterCounts
  selectedBookingId: string | null
  getQueueMeta: (bookingId: string) => QueueMetaItem | null
  onFilterChange: (filter: QueueFilter) => void
  onSelectBooking: (bookingId: string) => void
  onCheckInClick: () => void
}

export function BookingQueuePanel({
  isLoading,
  queueList,
  filterType,
  filterCounts,
  selectedBookingId,
  getQueueMeta,
  onFilterChange,
  onSelectBooking,
  onCheckInClick,
}: BookingQueuePanelProps) {
  const filterTabs = [
    { id: "ALL" as const, label: "Active Queue", count: filterCounts.all },
    { id: "WAITING" as const, label: "Waiting", count: filterCounts.waiting },
    { id: "IN_SERVICE" as const, label: "In Service", count: filterCounts.inService },
    { id: "AWAITING_HANDOVER" as const, label: "Ready", count: filterCounts.handover },
    ...(filterCounts.stalled > 0
      ? [{ id: "STALLED" as const, label: "Stalled", count: filterCounts.stalled }]
      : []),
  ]

  return (
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
        {filterTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onFilterChange(t.id)}
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
                All arriving customers have been served or no active sessions are currently in
                progress.
              </p>
            </div>
            <button
              type="button"
              onClick={onCheckInClick}
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
                onClick={() => onSelectBooking(item.id)}
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
                      {item.vehicleDetails?.brand || "Vehicle"} {item.vehicleDetails?.model || ""}
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
  )
}
