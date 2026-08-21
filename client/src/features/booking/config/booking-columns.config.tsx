import type { Column } from "@/shared/components/data-table"
import { Eye, Building2, Car, Clock } from "lucide-react"
import type { Booking } from "../types/booking.types"
import { BOOKING_STATUS } from "@/shared/constants/booking.constants"

interface CustomerColumnHandlers {
  onNavigate: (bookingId: string) => void
}

export function getCustomerColumns({ onNavigate }: CustomerColumnHandlers): Column<Booking>[] {
  return [
    {
      id: "bookingNumber",
      header: "Booking ID",
      accessor: "bookingNumber",
      cell: (b) => (
        <div
          onClick={() => onNavigate(b.id)}
          className="space-y-0.5 text-left cursor-pointer group"
        >
          <span className="font-mono font-bold text-foreground text-xs group-hover:text-primary transition-colors flex items-center gap-1">
            <span>{b.bookingNumber}</span>
            <Eye size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
          <div className="text-[10px] text-muted-foreground">{b.slotDate}</div>
        </div>
      ),
    },
    {
      id: "stationName",
      header: "Wash Station",
      accessor: "stationName",
      cell: (b) => (
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
            <Building2 size={12} className="text-primary shrink-0" />
            <span>{b.stationName}</span>
          </div>
        </div>
      ),
    },
    {
      id: "serviceName",
      header: "Service & Vehicle",
      accessor: "serviceName",
      cell: (b) => (
        <div className="space-y-0.5 text-left">
          <span className="font-bold text-foreground text-xs">{b.serviceName}</span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
            <Car size={10} />
            <span>{b.vehicleNumber}</span>
            {b.vehicleType && <span className="text-primary/90 font-sans">({b.vehicleType})</span>}
          </div>
        </div>
      ),
    },
    {
      id: "slotTime",
      header: "Slot Time",
      accessor: "slotTime",
      cell: (b) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground text-left">
          <Clock size={12} className="text-muted-foreground shrink-0" />
          <span>{b.slotTime}</span>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      accessor: "amount",
      cell: (b) => (
        <div className="space-y-0.5 text-left">
          <span className="font-extrabold text-foreground text-xs">
            ₹{b.amount.toLocaleString("en-IN")}
          </span>
          <div className="text-[10px]">
            <span
              className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                b.paymentStatus === "PAID"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : b.paymentStatus === "FAILED"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {b.paymentStatus}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: "status",
      cell: (b) => {
        let badgeStyle = "bg-muted text-muted-foreground border-border"
        if (b.status === BOOKING_STATUS.COMPLETED)
          badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        if (b.status === BOOKING_STATUS.IN_SERVICE)
          badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse"
        if (b.status === BOOKING_STATUS.CONFIRMED)
          badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20"
        if (b.status === BOOKING_STATUS.CANCELLED) badgeStyle = "bg-red-500/10 text-red-400 border-red-500/20"
        if (b.status === BOOKING_STATUS.NO_SHOW) badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/20"

        return (
          <span
            onClick={() => onNavigate(b.id)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-black uppercase tracking-wider cursor-pointer hover:opacity-80 ${badgeStyle}`}
          >
            {b.status.replace("_", " ")}
          </span>
        )
      },
    },
  ]
}

interface ManagementColumnHandlers {
  onNavigate: (bookingId: string) => void
  isManager?: boolean
}

export function getManagementColumns({
  onNavigate,
  isManager = false,
}: ManagementColumnHandlers): Column<Booking>[] {
  const cols: Column<Booking>[] = [
    {
      id: "bookingNumber",
      header: "Booking ID",
      accessor: "bookingNumber",
      cell: (b) => (
        <div
          onClick={() => onNavigate(b.id)}
          className="space-y-0.5 text-left cursor-pointer group"
        >
          <span className="font-mono font-bold text-foreground text-xs group-hover:text-primary transition-colors flex items-center gap-1">
            <span>{b.bookingNumber}</span>
            <Eye size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
          <div className="text-[10px] text-muted-foreground">{b.slotDate}</div>
        </div>
      ),
    },
    {
      id: "customerName",
      header: "Customer",
      accessor: "customerName",
      cell: (b) => (
        <div onClick={() => onNavigate(b.id)} className="space-y-0.5 text-left cursor-pointer">
          <span className="font-bold text-foreground text-xs">{b.customerName}</span>
          {b.customerPhone && (
            <div className="text-[10px] text-muted-foreground font-mono">{b.customerPhone}</div>
          )}
        </div>
      ),
    },
  ]

  if (!isManager) {
    cols.push({
      id: "stationName",
      header: "Wash Station",
      accessor: "stationName",
      cell: (b) => (
        <div onClick={() => onNavigate(b.id)} className="space-y-0.5 text-left cursor-pointer">
          <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
            <Building2 size={12} className="text-primary shrink-0" />
            <span>{b.stationName}</span>
          </div>
        </div>
      ),
    })
  }

  cols.push(
    {
      id: "serviceName",
      header: "Service & Vehicle",
      accessor: "serviceName",
      cell: (b) => (
        <div onClick={() => onNavigate(b.id)} className="space-y-0.5 text-left cursor-pointer">
          <span className="font-bold text-foreground text-xs">{b.serviceName}</span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
            <Car size={10} />
            <span>{b.vehicleNumber}</span>
            {b.vehicleType && <span className="text-primary/90 font-sans">({b.vehicleType})</span>}
          </div>
        </div>
      ),
    },
    {
      id: "slotTime",
      header: "Slot Time",
      accessor: "slotTime",
      cell: (b) => (
        <div
          onClick={() => onNavigate(b.id)}
          className="flex items-center gap-1.5 text-xs font-semibold text-foreground text-left cursor-pointer"
        >
          <Clock size={12} className="text-muted-foreground shrink-0" />
          <span>{b.slotTime}</span>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      accessor: "amount",
      cell: (b) => (
        <div onClick={() => onNavigate(b.id)} className="space-y-0.5 text-left cursor-pointer">
          <span className="font-extrabold text-foreground text-xs">
            ₹{b.amount.toLocaleString("en-IN")}
          </span>
          <div className="text-[10px]">
            <span
              className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                b.paymentStatus === "PAID"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : b.paymentStatus === "FAILED"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {b.paymentStatus}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: "status",
      cell: (b) => {
        let badgeStyle = "bg-muted text-muted-foreground border-border"
        if (b.status === BOOKING_STATUS.COMPLETED)
          badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        if (b.status === BOOKING_STATUS.IN_SERVICE)
          badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse"
        if (b.status === BOOKING_STATUS.CONFIRMED)
          badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20"
        if (b.status === BOOKING_STATUS.CANCELLED) badgeStyle = "bg-red-500/10 text-red-400 border-red-500/20"
        if (b.status === BOOKING_STATUS.NO_SHOW) badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/20"

        return (
          <span
            onClick={() => onNavigate(b.id)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-black uppercase tracking-wider cursor-pointer hover:opacity-80 ${badgeStyle}`}
          >
            {b.status.replace("_", " ")}
          </span>
        )
      },
    }
  )

  return cols
}
