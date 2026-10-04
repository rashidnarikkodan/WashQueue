import { ShieldCheck, CreditCard } from "lucide-react"
import type { BookingResponse } from "@/shared/apis/booking.api"
import { getServiceDisplayName } from "../../utils/booking-display.utils"

interface BookingSpecificationsCardProps {
  booking: BookingResponse
  formattedDates: { dateStr: string; timeStr: string }
}

export default function BookingSpecificationsCard({
  booking,
  formattedDates,
}: BookingSpecificationsCardProps) {
  const serviceName = getServiceDisplayName(booking)
  const paymentMethodStr = booking.paymentMethod
    ? booking.paymentMethod.replace("_", " ")
    : "ONLINE"
  const paymentStatusStr = booking.paymentStatus || "PENDING"

  return (
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
          <p className="text-xs text-muted-foreground">Precision wash &amp; surface treatment</p>
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
            <p className="text-xs text-muted-foreground font-medium">No extra add-ons selected.</p>
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
  )
}
