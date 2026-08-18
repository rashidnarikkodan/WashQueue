import { useState } from "react"
import {
  MapPin,
  Star,
  Car,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Smartphone,
  Building,
} from "lucide-react"
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
  onProceed: (paymentMethod: "ONLINE" | "CASH") => void
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
  onProceed,
  isSubmitting,
  canSubmit,
}: BookingSummaryCardProps) {
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">("ONLINE")

  const basePrice = selectedPlan ? selectedPlan.price : 0
  const extrasPrice = selectedExtras.reduce((sum, e) => sum + e.price, 0)
  const totalPrice = basePrice + extrasPrice

  const handleMainCTA = () => {
    if (!canSubmit || isSubmitting) return
    onProceed(paymentMethod)
  }

  return (
    <div className="w-full flex flex-col gap-6 p-6 sm:p-7 rounded-3xl border border-border/60 bg-card shadow-2xl text-left sticky top-24 text-card-foreground">
      {/* Header Section */}
      <div className="space-y-1 pb-4 border-b border-border/60">
        <h3 className="text-xl font-bold text-foreground tracking-tight">Booking Summary</h3>
        <p className="text-xs text-muted-foreground">Review your wash booking details</p>
      </div>

      {/* Station Details Header */}
      {station && (
        <div className="flex items-center justify-between pb-3 border-b border-border/40 text-xs">
          <div className="space-y-1">
            <div className="font-semibold text-foreground truncate max-w-[220px]">
              {station.name}
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <MapPin size={11} className="shrink-0 text-muted-foreground" />
              <span className="truncate">{station.address.city}</span>
            </p>
          </div>
          {station.rating > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              <span>{station.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      )}

      {/* Clean Overview Items */}
      <div className="space-y-3.5 text-xs sm:text-sm">
        {/* Vehicle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Car size={16} className="text-primary shrink-0" />
            <span className="text-foreground font-semibold">
              {selectedVehicle
                ? selectedVehicle.nickname || `${selectedVehicle.brand} ${selectedVehicle.model}`
                : "No vehicle selected"}
            </span>
          </div>
          {selectedVehicle?.registrationNumber && (
            <span className="text-xs font-mono text-muted-foreground">
              {selectedVehicle.registrationNumber}
            </span>
          )}
        </div>

        {/* Service Plan */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <ShieldCheck size={16} className="text-primary shrink-0" />
            <span className="text-foreground font-semibold">
              {selectedPlan ? selectedPlan.name : "No plan selected"}
            </span>
          </div>
          {selectedPlan && (
            <span className="font-bold text-foreground">
              ₹{selectedPlan.price.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Add-ons */}
        {selectedExtras.map((extra) => (
          <div
            key={extra.id}
            className="flex items-center justify-between pl-7 text-xs text-muted-foreground"
          >
            <span>+ {extra.name}</span>
            <span className="font-semibold text-foreground">
              ₹{extra.price.toLocaleString("en-IN")}
            </span>
          </div>
        ))}

        {/* Scheduled Slot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Calendar size={16} className="text-primary shrink-0" />
            <span className="text-foreground font-semibold">
              {selectedDateFormatted || "Select date"}
            </span>
          </div>
          {selectedTimeWindow && (
            <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
              <Clock size={12} className="text-muted-foreground" />
              <span>{selectedTimeWindow}</span>
            </div>
          )}
        </div>
      </div>

      {/* Total Price Display */}
      <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-1">
        <div className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
          TOTAL PRICE
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-primary tracking-tight">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-muted-foreground font-medium">Inclusive of GST</span>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="space-y-3">
        <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          PAYMENT METHOD
        </div>

        {/* Option 1: Pay Now (Selected / Active) */}
        <div
          onClick={() => setPaymentMethod("ONLINE")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
            paymentMethod === "ONLINE"
              ? "border-primary/80 bg-primary/10 shadow-[0_0_15px_rgba(77,142,255,0.1)]"
              : "border-border/60 bg-muted/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Pay Now</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-primary/20 text-primary">
              RECOMMENDED
            </span>
          </div>
          <div className="flex items-center gap-2 pl-7 opacity-80 text-muted-foreground">
            <Smartphone size={16} />
            <Building size={16} />
          </div>
        </div>

        {/* Option 2: Pay At Station (Unselected / Disabled) */}
        <div className="p-4 rounded-2xl border border-border/40 bg-muted/10 opacity-60 cursor-not-allowed space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/40" />
              <span className="text-sm font-medium text-muted-foreground">Pay At Station</span>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted/40 px-2 py-0.5 rounded">
              UNAVAILABLE
            </span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
        <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
        <span className="text-[11px] leading-tight">
          Your slot will be instantly confirmed after successful payment.
        </span>
      </div>

      {/* Main CTA Button */}
      <button
        type="button"
        disabled={!canSubmit || isSubmitting}
        onClick={handleMainCTA}
        className={`w-full py-4 rounded-full font-bold text-base flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
          canSubmit && !isSubmitting
            ? "bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-slate-950 shadow-blue-500/25 active:scale-98"
            : "bg-muted text-muted-foreground border border-border cursor-not-allowed"
        }`}
      >
        <span>
          {isSubmitting
            ? "Processing..."
            : paymentMethod === "ONLINE"
              ? "Proceed to Payment"
              : "Confirm Booking"}
        </span>
        <ArrowRight size={18} />
      </button>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground text-center">
        <Lock size={12} className="opacity-60" />
        <span>Secure payments powered by encrypted checkout.</span>
      </div>
    </div>
  )
}
