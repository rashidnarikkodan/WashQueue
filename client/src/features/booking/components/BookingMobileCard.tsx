import React from "react"
import { Building2, Car, Clock, ChevronRight, User as UserIcon } from "lucide-react"
import type { Booking } from "../types/booking.types"
import { BOOKING_STATUS } from "@/shared/constants/booking.constants"

interface BookingMobileCardProps {
  booking: Booking
  onNavigate: (bookingId: string) => void
  showCustomerInfo?: boolean
}

export const BookingMobileCard: React.FC<BookingMobileCardProps> = ({
  booking,
  onNavigate,
  showCustomerInfo = false,
}) => {
  let badgeStyle = "bg-muted text-muted-foreground border-border"
  if (booking.status === BOOKING_STATUS.COMPLETED)
    badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  if (booking.status === BOOKING_STATUS.IN_SERVICE)
    badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/20"
  if (booking.status === BOOKING_STATUS.CONFIRMED)
    badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20"
  if (booking.status === BOOKING_STATUS.CANCELLED)
    badgeStyle = "bg-red-500/10 text-red-400 border-red-500/20"
  if (booking.status === BOOKING_STATUS.NO_SHOW)
    badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/20"

  return (
    <div
      onClick={() => onNavigate(booking.id)}
      className="p-3.5 bg-card/70 border border-border/60 rounded-xl space-y-2.5 active:scale-[0.99] transition-all cursor-pointer text-left shadow-xs"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-foreground text-xs">
            {booking.bookingNumber}
          </span>
          <span className="text-[11px] text-muted-foreground">• {booking.slotDate}</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}
        >
          {booking.status.replace("_", " ")}
        </span>
      </div>

      {showCustomerInfo && booking.customerName && (
        <div className="flex items-center justify-between text-xs pt-0.5 border-t border-border/30">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <UserIcon size={12} className="text-muted-foreground" />
            <span>{booking.customerName}</span>
          </div>
          {booking.customerPhone && (
            <span className="text-[11px] text-muted-foreground font-mono">
              {booking.customerPhone}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/30">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Building2 size={11} className="text-primary shrink-0" />
            <span className="truncate">{booking.stationName || "Wash Station"}</span>
          </div>
          <div className="font-semibold text-foreground truncate">{booking.serviceName}</div>
        </div>

        <div className="space-y-0.5 text-right">
          <div className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
            <Clock size={11} className="shrink-0" />
            <span>{booking.slotTime}</span>
          </div>
          <div className="flex items-center justify-end gap-1 text-[11px] font-mono text-muted-foreground">
            <Car size={11} />
            <span className="text-foreground font-semibold">{booking.vehicleNumber}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-border/30 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-sm">
            ₹{booking.amount?.toLocaleString("en-IN")}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              booking.paymentStatus === "PAID"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : booking.paymentStatus === "FAILED"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}
          >
            {booking.paymentStatus}
          </span>
        </div>
        <div className="flex items-center gap-1 text-primary text-xs font-semibold">
          <span>Details</span>
          <ChevronRight size={13} />
        </div>
      </div>
    </div>
  )
}

export default BookingMobileCard
