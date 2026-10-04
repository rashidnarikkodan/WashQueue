import { IssuePriority } from "../types/issue.types"

interface IssuePriorityBadgeProps {
  priority?: IssuePriority | string
  size?: "sm" | "md"
  className?: string
}

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  [IssuePriority.CRITICAL]: {
    label: "CRITICAL",
    className:
      "bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)] font-black",
  },
  [IssuePriority.HIGH]: {
    label: "HIGH",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/30 font-bold",
  },
  [IssuePriority.MEDIUM]: {
    label: "MEDIUM",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/25 font-bold",
  },
  [IssuePriority.LOW]: {
    label: "LOW",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 font-bold",
  },
}

export default function IssuePriorityBadge({
  priority,
  size = "md",
  className = "",
}: IssuePriorityBadgeProps) {
  const normPriority = (priority || IssuePriority.MEDIUM).toUpperCase()
  const config = PRIORITY_CONFIG[normPriority] || {
    label: normPriority,
    className: "bg-muted text-muted-foreground border-border font-bold",
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[9px]",
    md: "px-2.5 py-0.5 text-[10px]",
  }

  return (
    <span
      className={`inline-flex items-center uppercase tracking-wider rounded-md border ${config.className} ${sizeClasses[size]} ${className}`}
    >
      {config.label}
    </span>
  )
}
