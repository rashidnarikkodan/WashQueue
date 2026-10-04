import {
  History,
  XCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  QrCode,
  Clock,
  AlertTriangle,
  Activity,
} from "lucide-react"
import type { BookingResponse } from "@/shared/apis/booking.api"

function getStatusLogConfig(status?: string) {
  switch (status) {
    case "COMPLETED":
      return {
        label: "Completed",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
        dot: "bg-emerald-500 text-black shadow-sm",
        icon: CheckCircle2,
      }
    case "AWAITING_HANDOVER":
    case "SERVICE_COMPLETED":
      return {
        label: "Service Completed",
        badge: "bg-sky-500/10 text-sky-400 border-sky-500/25",
        dot: "bg-sky-500 text-white shadow-sm",
        icon: ShieldCheck,
      }
    case "IN_SERVICE":
      return {
        label: "In Service",
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/25",
        dot: "bg-blue-500 text-white shadow-sm",
        icon: Sparkles,
      }
    case "CHECKED_IN":
      return {
        label: "Checked In",
        badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
        dot: "bg-cyan-500 text-black shadow-sm",
        icon: QrCode,
      }
    case "CONFIRMED":
      return {
        label: "Confirmed",
        badge: "bg-primary/10 text-primary border-primary/25",
        dot: "bg-primary text-primary-foreground shadow-sm",
        icon: Clock,
      }
    case "CANCELLED":
      return {
        label: "Cancelled",
        badge: "bg-destructive/10 text-destructive border-destructive/25",
        dot: "bg-destructive text-white shadow-sm",
        icon: XCircle,
      }
    case "NO_SHOW":
    case "STALLED":
      return {
        label: status === "NO_SHOW" ? "No Show" : "Stalled",
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/25",
        dot: "bg-amber-500 text-black shadow-sm",
        icon: AlertTriangle,
      }
    default:
      return {
        label: status ? status.replace(/_/g, " ") : "Update",
        badge: "bg-muted text-muted-foreground border-border",
        dot: "bg-muted-foreground text-card shadow-sm",
        icon: Activity,
      }
  }
}

interface BookingActivityHistoryCardProps {
  booking: BookingResponse
}

export default function BookingActivityHistoryCard({ booking }: BookingActivityHistoryCardProps) {
  const showHistory =
    booking.status === "CANCELLED" ||
    booking.cancellation ||
    (booking.statusHistory && booking.statusHistory.length > 0)

  if (!showHistory) return null

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <History size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Activity &amp; Status History</h3>
            <p className="text-xs text-muted-foreground">
              Chronological audit trail of booking events
            </p>
          </div>
        </div>
        {booking.statusHistory && booking.statusHistory.length > 0 && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border">
            {booking.statusHistory.length} {booking.statusHistory.length === 1 ? "log" : "logs"}
          </span>
        )}
      </div>

      {booking.status === "CANCELLED" && (
        <div className="p-4 rounded-2xl border border-destructive/25 bg-destructive/10 space-y-1.5">
          <div className="flex items-center gap-2 text-destructive font-bold text-sm">
            <XCircle size={16} />
            <h4>Booking Cancelled</h4>
          </div>
          <p className="text-xs text-foreground leading-relaxed pl-6">
            <span className="text-muted-foreground">Reason: </span>
            {booking.cancellation?.cancellationReason || "No cancellation reason provided."}
          </p>
          {booking.cancellation?.cancelledAt && (
            <span className="text-[10px] text-muted-foreground font-mono block pl-6">
              Cancelled at {new Date(booking.cancellation.cancelledAt).toLocaleString()}
            </span>
          )}
        </div>
      )}

      {booking.statusHistory && booking.statusHistory.length > 0 && (
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2.5 before:bottom-2.5 before:w-px before:bg-border">
          {booking.statusHistory.map((log) => {
            const config = getStatusLogConfig(log.toStatus)
            const StatusIcon = config.icon
            return (
              <div key={log.id} className="relative group">
                <div
                  className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-card ${config.dot}`}
                >
                  <StatusIcon size={12} />
                </div>

                <div className="space-y-1.5 pl-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${config.badge}`}
                    >
                      {config.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {log.reason && (
                    <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                      {log.reason}
                    </p>
                  )}

                  {log.notes && (
                    <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/50">
                      <span className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground/80 block mb-0.5">
                        Log Notes
                      </span>
                      <p className="italic text-foreground/80">{log.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
