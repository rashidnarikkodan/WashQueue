export interface BookingStageDefinition {
  id: string
  label: string
  description?: string
}

export const BOOKING_STAGES: BookingStageDefinition[] = [
  { id: "CONFIRMED", label: "Confirmed", description: "Booking confirmed & slot reserved" },
  { id: "CHECKED_IN", label: "Arrived", description: "Vehicle arrived at car wash station" },
  { id: "IN_QUEUE", label: "In Queue", description: "Waiting in queue for wash bay" },
  { id: "IN_SERVICE", label: "Washing", description: "Wash service in progress" },
  { id: "COMPLETED", label: "Ready", description: "Wash completed & ready for handover" },
]

export function getBookingStageIndex(status?: string): number {
  if (!status) return 0
  const s = status.toUpperCase()

  if (s === "PENDING" || s === "CONFIRMED") return 0
  if (s === "CHECKED_IN") return 1
  if (s === "IN_QUEUE") return 2
  if (s === "IN_SERVICE") return 3
  if (s === "SERVICE_COMPLETED" || s === "AWAITING_HANDOVER" || s === "COMPLETED") return 4
  if (s === "CANCELLED" || s === "NO_SHOW") return -1

  return 2
}

export function getBookingStatusBadgeStyle(status?: string): string {
  if (!status) return "bg-muted text-muted-foreground border-border/40"
  const s = status.toUpperCase()

  switch (s) {
    case "CONFIRMED":
    case "PENDING":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    case "CHECKED_IN":
    case "IN_QUEUE":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20"
    case "IN_SERVICE":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-xs shadow-purple-500/20 animate-pulse"
    case "SERVICE_COMPLETED":
    case "AWAITING_HANDOVER":
    case "COMPLETED":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    case "CANCELLED":
    case "NO_SHOW":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20"
    default:
      return "bg-muted text-muted-foreground border-border/40"
  }
}
