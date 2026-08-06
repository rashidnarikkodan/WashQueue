import {
  Clock,
  Car,
  QrCode,
  XCircle,
  Phone,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  MapPin,
  Download,
  MessageSquare,
  ChevronRight,
} from "lucide-react"
import type { BookingResponse } from "@/shared/apis/booking.api"
import { toast } from "sonner"

interface CustomerBookingDetailsViewProps {
  booking: BookingResponse
  formattedDates: { dateStr: string; timeStr: string }
  currentStageIndex: number
  stages: Array<{ id: string; label: string }>
  onOpenCancelModal: () => void
}

export default function CustomerBookingDetailsView({
  booking,
  formattedDates,
  currentStageIndex,
  stages,
  onOpenCancelModal,
}: CustomerBookingDetailsViewProps) {
  const stationName = booking.stationDetails?.name || "WashQueue Service Terminal"
  const stationLocation = booking.stationDetails?.city || "Kavanur, Malappuram"
  const vehicleName = booking.vehicleDetails?.brand
    ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model || ""}`.trim()
    : "Porsche 911 GT3 RS"
  const plateNumber =
    booking.vehicleDetails?.registrationNumber || booking.walkInVehicle?.registrationNumber || "KL23AB1234"
  const serviceName = booking.serviceType === "FULL" ? "Diamond Ceramic Full Wash" : "Express Half Wash"

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      {/* Top Main Title Banner */}
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
          Manage your booking schedules, track live bay queue progress, and access check-in QR passes.
        </p>
      </div>

      {/* Hero 12-Column Grid Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8-Column Status Banner Card */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl border border-white/5 bg-[#151b2d]/80 backdrop-blur-md shadow-2xl space-y-8 relative overflow-hidden">
          {/* Top Status & Station Name */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    booking.status === "COMPLETED"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : booking.status === "IN_SERVICE" || booking.status === "CHECKED_IN"
                        ? "bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse"
                        : booking.status === "CANCELLED"
                          ? "bg-red-500/15 text-red-400 border border-red-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  <span>{booking.status.replace("_", " ")}</span>
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

            <div className="text-left sm:text-right space-y-1 bg-background/40 p-4 rounded-2xl border border-white/5 sm:border-0 sm:p-0 sm:bg-transparent">
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block">
                Total Paid Amount
              </span>
              <span className="text-2xl sm:text-3xl font-black text-foreground font-sans">
                ₹{booking.pricingSnapshot.totalPrice.toLocaleString("en-IN")}
              </span>
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                ✓ {booking.paymentStatus} via {booking.paymentType.replace("_", " ")}
              </div>
            </div>
          </div>

          {/* Interactive Progress Bar Tracker */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span>Service Progress</span>
              <span className="text-primary font-semibold">
                {currentStageIndex >= 0 ? `${(currentStageIndex + 1) * 20}% Completed` : "Cancelled"}
              </span>
            </div>

            {/* Stages Circles */}
            <div className="relative flex justify-between items-center z-10 px-2">
              <div className="absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-white/10 -z-10 rounded-full" />
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
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-lg ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110"
                          : isPassed
                            ? "bg-emerald-500 text-slate-950 font-black"
                            : "bg-slate-800 text-slate-400 border border-white/10"
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

          {/* Action Control Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5">
            <div>
              {(booking.status === "CONFIRMED" || booking.status === "PENDING") && (
                <button
                  type="button"
                  onClick={onOpenCancelModal}
                  className="px-5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                >
                  <XCircle size={15} />
                  <span>Cancel Booking</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => toast.info("Downloading Invoice PDF...")}
              className="px-5 py-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <Download size={15} />
              <span>Download Invoice</span>
            </button>
          </div>
        </div>

        {/* Right 4-Column Check-in QR & Quick Access Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Check-In QR Pass Card */}
          <div className="p-6 rounded-3xl border border-white/5 bg-[#191f31] shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <QrCode size={18} className="text-primary" />
                <span>Check-In QR Pass</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                #{booking.bookingNumber}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-border flex items-center justify-center">
              <div className="p-2 border-4 border-black rounded-xl text-black text-center space-y-2">
                <QrCode size={160} className="text-black mx-auto" />
                <div className="text-[10px] font-mono font-black tracking-widest text-slate-900">
                  {booking.bookingNumber}
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Show this QR code at the station bay entrance for automated check-in scanning.
            </p>
          </div>

          {/* Station Details & Directions */}
          <div className="p-6 rounded-3xl border border-white/5 bg-[#191f31] shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">
                Station &amp; Location
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                4.9 ★ Rating
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-foreground">{stationName}</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin size={13} className="text-primary shrink-0" />
                <span>{stationLocation}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                window.open(
                  `https://maps.google.com/?q=${encodeURIComponent(stationName + " " + stationLocation)}`,
                  "_blank"
                )
              }
              className="w-full py-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Navigation size={14} className="text-primary" />
              <span>Get Directions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom 12-Column Grid Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8-Column Intelligence HUD & Specifications */}
        <div className="lg:col-span-8 space-y-8">
          {/* Queue Intelligence 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl border border-white/5 bg-[#151b2d] space-y-2 text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                Queue Position
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground">#03</span>
                <span className="text-xs font-bold text-emerald-400">Top 5%</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-white/5 bg-[#151b2d] space-y-2 text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                Vehicles Ahead
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground">02</span>
                <span className="text-xs font-medium text-primary">In live queue</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-white/5 bg-[#151b2d] space-y-2 text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                Estimated Wait
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground">12</span>
                <span className="text-xs text-muted-foreground font-medium">mins</span>
              </div>
            </div>
          </div>

          {/* Booking Tier & Specifications Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/5 bg-[#191f31] shadow-2xl space-y-6 text-left">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <ShieldCheck size={18} className="text-primary" />
              <h3 className="text-lg font-bold text-foreground">Booking Specifications</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                  Service Tier
                </span>
                <h4 className="text-base font-bold text-foreground">{serviceName}</h4>
                <p className="text-xs text-muted-foreground">Precision wash &amp; surface shine treatment</p>
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
                        className="px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] font-semibold text-foreground"
                      >
                        {es.name} (+₹{es.price})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground font-medium">No extra add-ons selected.</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                  Payment Method
                </span>
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <CreditCard size={16} className="text-primary" />
                  <span>{booking.paymentType.replace("_", " ")}</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">**** 9012 • Verified</p>
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

          {/* Payment Summary Breakdown */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/5 bg-[#191f31] shadow-2xl space-y-4 text-left">
            <h3 className="text-lg font-bold text-foreground border-b border-white/5 pb-4">
              Payment Summary Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>{serviceName} (Base)</span>
                <span className="font-bold text-foreground">
                  ₹{booking.pricingSnapshot.basePrice.toLocaleString("en-IN")}
                </span>
              </div>

              {booking.pricingSnapshot.extraPrice > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Extra Add-ons Total</span>
                  <span className="font-bold text-foreground">
                    +₹{booking.pricingSnapshot.extraPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Platform Booking Fee</span>
                <span className="font-bold text-foreground">₹0</span>
              </div>

              <div className="flex justify-between text-sm font-black text-foreground pt-3 border-t border-white/5">
                <span>Total Amount Paid</span>
                <span className="text-primary font-sans text-base">
                  ₹{booking.pricingSnapshot.totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4-Column Vehicle Info & Support Section */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Vehicle Info Card */}
          <div className="p-6 rounded-3xl border border-white/5 bg-[#191f31] shadow-2xl space-y-4 text-left">
            <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">
              Active Vehicle Snapshot
            </h3>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-primary shrink-0">
                <Car size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-foreground">{vehicleName}</h4>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-muted text-[11px] font-mono font-bold text-muted-foreground">
                    {plateNumber}
                  </span>
                  <span className="text-xs text-muted-foreground">Premium SUV</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-background/30 border border-white/5 space-y-0.5">
                <span className="text-[9px] font-black uppercase text-muted-foreground block">
                  Color
                </span>
                <span className="text-xs font-bold text-foreground">Shark Blue</span>
              </div>
              <div className="p-3 rounded-xl bg-background/30 border border-white/5 space-y-0.5">
                <span className="text-[9px] font-black uppercase text-muted-foreground block">
                  Year
                </span>
                <span className="text-xs font-bold text-foreground">2023</span>
              </div>
            </div>
          </div>

          {/* Support & Contact Card */}
          <div className="p-6 rounded-3xl border border-white/5 bg-[#191f31] shadow-2xl space-y-4 text-left">
            <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">
              Support &amp; Assistance
            </h3>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() =>
                  toast.info(`Calling station at ${booking.stationDetails?.phone || "+91 98765 43210"}`)
                }
                className="w-full p-3.5 rounded-2xl bg-card border border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-primary" />
                  <span>Contact Station</span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>

              <button
                type="button"
                onClick={() => toast.info("Opening Live Support Chat...")}
                className="w-full p-3.5 rounded-2xl bg-card border border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare size={16} className="text-primary" />
                  <span>Live Chat Support</span>
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
