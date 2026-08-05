import { MapPin, Star, ShieldCheck, Car, Calendar, Clock, Loader2, ArrowRight } from "lucide-react"
import type { Station } from "@/features/station/types"
import type { Vehicle } from "@/features/vehicle/types"
import type { ServicePlanOption, ExtraServiceOption } from "./ServiceSelectionStep"

interface BookingSummaryCardProps {
  station: Station | null
  selectedVehicle: Vehicle | null
  selectedPlan: ServicePlanOption | null
  selectedExtras: ExtraServiceOption[]
  selectedDateFormatted: string
  selectedTimeWindow: string | null
  onSubmit: () => void
  isSubmitting?: boolean
  canSubmit?: boolean
}

export default function BookingSummaryCard({
  station,
  selectedVehicle,
  selectedPlan,
  selectedExtras,
  selectedDateFormatted,
  selectedTimeWindow,
  onSubmit,
  isSubmitting,
  canSubmit,
}: BookingSummaryCardProps) {
  const basePrice = selectedPlan ? selectedPlan.price : 0
  const extrasPrice = selectedExtras.reduce((sum, e) => sum + e.price, 0)
  const totalPrice = basePrice + extrasPrice

  return (
    <div className="w-full flex flex-col gap-6 p-6 rounded-3xl border border-border bg-card shadow-2xl text-left sticky top-24 text-card-foreground">
      {/* Station Header info */}
      {station ? (
        <div className="space-y-3 pb-5 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              OPEN NOW
            </span>

            {station.rating > 0 && (
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <Star size={12} className="fill-amber-500 text-amber-500" />
                <span>{station.rating.toFixed(1)}</span>
                <span className="text-muted-foreground font-normal">({station.reviewCount})</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-black text-foreground tracking-tight">
              {station.name}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
              <MapPin size={12} className="text-muted-foreground shrink-0" />
              <span>
                {station.address.street}, {station.address.city}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
      )}

      {/* Selected Items Summary List */}
      <div className="space-y-4 text-xs">
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
          Booking Overview
        </h4>

        {/* Selected Vehicle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
          <div className="flex items-center gap-3">
            <Car size={16} className="text-primary" />
            <div>
              <div className="font-bold text-foreground">
                {selectedVehicle
                  ? selectedVehicle.nickname || `${selectedVehicle.brand} ${selectedVehicle.model}`
                  : "No vehicle selected"}
              </div>
              {selectedVehicle?.registrationNumber && (
                <div className="text-[10px] font-mono text-muted-foreground">
                  {selectedVehicle.registrationNumber}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Service */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
          <div className="flex items-center gap-3">
            <ShieldCheck size={16} className="text-primary" />
            <div>
              <div className="font-bold text-foreground">
                {selectedPlan ? selectedPlan.name : "No service package"}
              </div>
              {selectedExtras.length > 0 && (
                <div className="text-[10px] text-muted-foreground">
                  +{selectedExtras.length} extra service(s)
                </div>
              )}
            </div>
          </div>
          {selectedPlan && (
            <span className="font-extrabold text-foreground">
              ₹{selectedPlan.price.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Selected Date & Slot */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-primary" />
            <div>
              <div className="font-bold text-foreground">
                {selectedDateFormatted || "Select Date"}
              </div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock size={10} />
                <span>{selectedTimeWindow || "Select time slot"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-2 pt-4 border-t border-border text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Base Wash Plan</span>
          <span className="text-foreground font-semibold">₹{basePrice.toLocaleString("en-IN")}</span>
        </div>

        {selectedExtras.map((e) => (
          <div key={e.id} className="flex items-center justify-between text-muted-foreground">
            <span>{e.name}</span>
            <span className="text-foreground font-semibold">+₹{e.price.toLocaleString("en-IN")}</span>
          </div>
        ))}

        <div className="flex items-center justify-between text-muted-foreground">
          <span>Service Fee & Taxes</span>
          <span className="text-emerald-500 font-bold">FREE</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border text-base font-black text-foreground">
          <span>Total Amount</span>
          <span className="text-2xl font-black text-primary">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Confirmation Submit Button */}
      <button
        type="button"
        disabled={!canSubmit || isSubmitting}
        onClick={onSubmit}
        className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
          canSubmit && !isSubmitting
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 active:scale-98"
            : "bg-muted text-muted-foreground border border-border cursor-not-allowed"
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Booking Slot...</span>
          </>
        ) : (
          <>
            <span>Confirm & Book Slot</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  )
}
