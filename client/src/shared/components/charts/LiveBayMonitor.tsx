import React from "react"
import { Car, Clock, Sparkles, CheckCircle2 } from "lucide-react"
import type { LiveBayState } from "@/shared/apis/analytics.api"

interface LiveBayMonitorProps {
  bays: LiveBayState[]
  onBayAction?: (bay: LiveBayState) => void
}

export const LiveBayMonitor: React.FC<LiveBayMonitorProps> = ({ bays, onBayAction }) => {
  if (!bays || bays.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 border border-dashed border-border rounded-2xl text-muted-foreground text-xs">
        No bays configured for this station.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {bays.map((bay) => {
        const isOccupied = bay.isOccupied

        return (
          <div
            key={bay.bayNumber}
            className={`relative p-5 rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
              isOccupied
                ? "border-primary/50 bg-primary/5 shadow-sm"
                : "border-border/70 bg-card/50"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs uppercase px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border">
                  Bay {String(bay.bayNumber).padStart(2, "0")}
                </span>
                {isOccupied ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/15 text-primary border border-primary/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    Washing Now
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Available
                  </span>
                )}
              </div>

              {isOccupied && bay.timeRemainingMinutes !== undefined && (
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                  <Clock className="w-3 h-3" />
                  <span>~{bay.timeRemainingMinutes}m left</span>
                </div>
              )}
            </div>

            <div className="my-4 space-y-2">
              {isOccupied ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-sm text-foreground tracking-wider uppercase">
                        {bay.vehiclePlate || "VEHICLE"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bay.serviceType || "Full Service"} • #{bay.currentBookingNumber}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-3 text-center text-muted-foreground/60">
                  <Sparkles className="w-6 h-6 mb-1 text-emerald-500/40" />
                  <p className="text-xs font-medium">Ready for next vehicle</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px]">
                {isOccupied ? "Occupied Bay" : "Open Slot"}
              </span>
              {onBayAction && (
                <button
                  onClick={() => onBayAction(bay)}
                  className="font-semibold text-primary hover:underline text-xs cursor-pointer"
                >
                  {isOccupied ? "View Status" : "Assign Booking"}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default LiveBayMonitor
