import { BarChart2, Clock, Eye, AlertOctagon, CheckCircle2, AlertTriangle } from "lucide-react"
import type { IssueMetrics } from "../types/issue.types"

interface IssueStatsHUDProps {
  metrics: IssueMetrics
  onCardClick?: (filterType: string) => void
  activeFilter?: string
}

export default function IssueStatsHUD({ metrics, onCardClick, activeFilter }: IssueStatsHUDProps) {
  const cards = [
    {
      id: "TOTAL",
      label: "TOTAL ISSUES",
      value: metrics.totalIssues.toLocaleString(),
      badgeText: metrics.totalTrend || "+12%",
      badgeColor: "text-emerald-400 bg-emerald-500/10",
      icon: BarChart2,
      accentBorder: "border-border",
    },
    {
      id: "OPEN",
      label: "OPEN",
      value: metrics.openIssues.toString().padStart(2, "0"),
      badgeText: metrics.openTrend || "+4",
      badgeColor: "text-blue-400 bg-blue-500/10",
      icon: Clock,
      accentBorder: "border-border",
    },
    {
      id: "UNDER_REVIEW",
      label: "UNDER REVIEW",
      value: metrics.underReviewIssues.toString().padStart(2, "0"),
      badgeText: metrics.underReviewTrend || "Stable",
      badgeColor: "text-slate-400 bg-slate-500/10",
      icon: Eye,
      accentBorder: "border-border",
    },
    {
      id: "ESCALATED",
      label: "ESCALATED",
      value: metrics.escalatedIssues.toString().padStart(2, "0"),
      badgeText: metrics.escalatedTrend || "-2",
      badgeColor: "text-purple-400 bg-purple-500/10",
      icon: AlertOctagon,
      accentBorder: "border-border",
    },
    {
      id: "RESOLVED",
      label: "RESOLVED TODAY",
      value: metrics.resolvedTodayIssues.toString().padStart(2, "0"),
      badgeText: metrics.resolvedTodayTrend || "+8%",
      badgeColor: "text-emerald-400 bg-emerald-500/10",
      icon: CheckCircle2,
      accentBorder: "border-emerald-500/40 bg-emerald-500/5",
      iconColor: "text-emerald-400",
    },
    {
      id: "CRITICAL",
      label: "CRITICAL",
      value: metrics.criticalIssues.toString().padStart(2, "0"),
      badgeText: metrics.criticalTrend || "Alert",
      badgeColor: "text-red-400 bg-red-500/10 font-bold",
      icon: AlertTriangle,
      accentBorder: "border-red-500/40 bg-red-500/5",
      iconColor: "text-red-400",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const isSelected = activeFilter === card.id

        return (
          <div
            key={card.id}
            onClick={() => onCardClick?.(card.id)}
            className={`p-4 sm:p-5 rounded-2xl bg-card border transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-primary/50 hover:shadow-md ${
              isSelected ? "ring-2 ring-primary border-primary bg-primary/5" : card.accentBorder
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-muted/60 border border-border/60">
                <Icon className={`w-4 h-4 ${card.iconColor || "text-muted-foreground"}`} />
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-border/40 ${card.badgeColor}`}
              >
                {card.badgeText}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase block truncate">
                {card.label}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {card.value}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
