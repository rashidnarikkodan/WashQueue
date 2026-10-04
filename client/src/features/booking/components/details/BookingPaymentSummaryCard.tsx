import type { ReactNode } from "react"
import type { BookingResponse } from "@/shared/apis/booking.api"
import { getServiceDisplayName } from "../../utils/booking-display.utils"

interface BookingPaymentSummaryCardProps {
  booking: BookingResponse
  action?: ReactNode
  variant?: "full" | "sidebar"
}

export default function BookingPaymentSummaryCard({
  booking,
  action,
  variant = "full",
}: BookingPaymentSummaryCardProps) {
  const serviceName = getServiceDisplayName(booking)
  const basePrice = booking.pricingSnapshot?.basePrice ?? 0
  const extraPrice = booking.pricingSnapshot?.extraPrice ?? 0
  const totalPrice = booking.pricingSnapshot?.totalPrice ?? 0
  const paymentStatus = booking.paymentStatus || "PENDING"

  if (variant === "sidebar") {
    return (
      <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-4 text-left">
        <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest border-b border-border pb-3">
          FINANCIAL SUMMARY
        </h4>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Base Service Fee ({serviceName})</span>
            <span className="font-bold text-foreground">₹{basePrice.toLocaleString("en-IN")}</span>
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
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                booking.status === "CANCELLED"
                  ? "bg-destructive/10 text-destructive border-destructive/30"
                  : "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
              }`}
            >
              {booking.status === "CANCELLED" ? "REFUNDED" : paymentStatus}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <h3 className="text-lg font-bold text-foreground">Payment Summary Breakdown</h3>
        {action && <div>{action}</div>}
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>{serviceName} (Base)</span>
          <span className="font-bold text-foreground">₹{basePrice.toLocaleString("en-IN")}</span>
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
  )
}
