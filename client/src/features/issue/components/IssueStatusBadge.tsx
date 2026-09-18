import { IssueStatus } from "../types/issue.types"

interface IssueStatusBadgeProps {
  status: IssueStatus | string
  size?: "sm" | "md" | "lg"
  className?: string
}

const STATUS_CONFIG: Record<string, { label: string; dotClass: string; containerClass: string }> = {
  [IssueStatus.OPEN]: {
    label: "Open",
    dotClass: "bg-amber-400 animate-pulse",
    containerClass: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15",
  },
  [IssueStatus.UNDER_REVIEW]: {
    label: "Under Review",
    dotClass: "bg-blue-400 animate-pulse",
    containerClass: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15",
  },
  [IssueStatus.ESCALATED]: {
    label: "Escalated",
    dotClass: "bg-purple-400 animate-pulse",
    containerClass: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/15",
  },
  [IssueStatus.RESOLVED]: {
    label: "Resolved",
    dotClass: "bg-emerald-400",
    containerClass:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15",
  },
  [IssueStatus.CLOSED]: {
    label: "Closed",
    dotClass: "bg-slate-400",
    containerClass: "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/15",
  },
}

export default function IssueStatusBadge({
  status,
  size = "md",
  className = "",
}: IssueStatusBadgeProps) {
  const normStatus = (status || IssueStatus.OPEN).toUpperCase()
  const config = STATUS_CONFIG[normStatus] || {
    label: normStatus.replace("_", " "),
    dotClass: "bg-slate-400",
    containerClass: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-2",
    lg: "px-3 py-1.5 text-sm gap-2.5",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold border transition-colors ${config.containerClass} ${sizeClasses[size]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  )
}
