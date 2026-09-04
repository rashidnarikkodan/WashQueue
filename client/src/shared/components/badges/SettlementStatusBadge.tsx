import { CheckCircle, Clock, AlertTriangle, ShieldAlert, RotateCcw, Loader2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { SettlementStatus } from "@/shared/apis/settlement.api"

interface StatusConfig {
  label: string
  icon: LucideIcon
  className: string
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  PROCESSING: {
    label: "Processing",
    icon: Loader2,
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  PROCESSED: {
    label: "Processed",
    icon: CheckCircle,
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  HELD: {
    label: "Held",
    icon: ShieldAlert,
    className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  FAILED: {
    label: "Failed",
    icon: AlertTriangle,
    className: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
  REVERSED: {
    label: "Reversed",
    icon: RotateCcw,
    className: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  },
}

interface SettlementStatusBadgeProps {
  status: SettlementStatus | string
  size?: "sm" | "md"
}

export function SettlementStatusBadge({ status, size = "sm" }: SettlementStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING
  const Icon = config.icon
  const sizeClasses =
    size === "sm" ? "px-2.5 py-1 text-xs rounded-lg" : "px-3 py-1 text-xs rounded-full"

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold border whitespace-nowrap ${sizeClasses} ${config.className}`}
    >
      <Icon className={`w-3 h-3 ${status === "PROCESSING" ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  )
}
