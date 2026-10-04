import { useMemo } from "react"
import { Car } from "lucide-react"
import type { BookingResponse } from "@/shared/apis/booking.api"
import { getVehicleDisplayName, getVehiclePlateNumber } from "../../utils/booking-display.utils"

interface CustomerVehicleProfileCardProps {
  booking: BookingResponse
  showCustomerDetails?: boolean
}

export default function CustomerVehicleProfileCard({
  booking,
  showCustomerDetails = false,
}: CustomerVehicleProfileCardProps) {
  const vehicleName = getVehicleDisplayName(booking)
  const plateNumber = getVehiclePlateNumber(booking)

  const customerName =
    booking.customerDetails?.name ||
    booking.walkInCustomer?.name ||
    (booking.isWalkIn ? "Walk-In Customer" : "Customer")
  const customerPhone = booking.customerDetails?.phone || booking.walkInCustomer?.phone || "N/A"

  const customerInitials = useMemo(() => {
    if (!customerName) return "CU"
    const parts = customerName.trim().split(" ")
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    return customerName.slice(0, 2).toUpperCase()
  }, [customerName])

  const customerBadge = useMemo(() => {
    if (booking.isWalkIn || booking.walkInCustomer) return "WALK-IN GUEST"
    return "REGISTERED USER"
  }, [booking.isWalkIn, booking.walkInCustomer])

  if (showCustomerDetails) {
    return (
      <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-6 text-left">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-xl flex items-center justify-center shrink-0">
            {customerInitials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-foreground">{customerName}</h4>
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-500">
                {customerBadge}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{customerPhone}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-muted/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase text-muted-foreground block">
                VEHICLE
              </span>
              <h5 className="text-sm font-bold text-foreground">{vehicleName}</h5>
              <p className="text-[11px] text-muted-foreground">
                {booking.vehicleDetails?.brand
                  ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model || ""}`.trim()
                  : booking.walkInVehicle?.registrationNumber
                    ? `Walk-In Entry`
                    : "Vehicle Information"}
              </p>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-muted text-foreground font-bold border border-border">
              {plateNumber}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-4 text-left">
      <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">
        Vehicle Information
      </h3>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary shrink-0">
          <Car size={28} />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-foreground">{vehicleName}</h4>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-muted text-[11px] font-mono font-bold text-muted-foreground">
              {plateNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
