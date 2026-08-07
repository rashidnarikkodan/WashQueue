import type { LucideIcon } from "lucide-react"
import React from "react"

export type StatVariant =
  "amber" | "emerald" | "red" | "rose" | "blue" | "primary" | "slate" | "default"

export interface StatItem {
  id?: string
  label: string
  value: number | string
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }> | React.ReactNode
  variant?: StatVariant
  colorClass?: string
  bgClass?: string

  description?: string
  onClick?: () => void
}

export interface StatsHUDProps {
  stats: StatItem[]
  columns?: 1 | 2 | 3 | 4 | 5
  className?: string
}

const VARIANT_CONFIG: Record<StatVariant, { text: string; bg: string }> = {
  amber: {
    text: "text-amber-500",
    bg: "bg-amber-500/10 text-amber-500",
  },
  emerald: {
    text: "text-emerald-500",
    bg: "bg-emerald-500/10 text-emerald-500",
  },
  red: {
    text: "text-red-500",
    bg: "bg-red-500/10 text-red-500",
  },
  rose: {
    text: "text-rose-500",
    bg: "bg-rose-500/10 text-rose-500",
  },
  blue: {
    text: "text-blue-500",
    bg: "bg-blue-500/10 text-blue-500",
  },
  primary: {
    text: "text-primary",
    bg: "bg-primary/10 text-primary",
  },
  slate: {
    text: "text-foreground",
    bg: "bg-muted text-muted-foreground",
  },
  default: {
    text: "text-foreground",
    bg: "bg-muted text-muted-foreground",
  },
}

const GRID_COLS_MAP: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
}

export const StatsHUD: React.FC<StatsHUDProps> = ({ stats, columns, className = "" }) => {
  if (!stats || stats.length === 0) return null

  // Determine grid cols based on stats count if not explicitly set
  const colsCount = columns || (Math.min(Math.max(stats.length, 1), 5) as 1 | 2 | 3 | 4 | 5)
  const gridClass = GRID_COLS_MAP[colsCount] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

  return (
    <div className={`grid ${gridClass} gap-4 ${className}`}>
      {stats.map((stat, idx) => {
        const variant = stat.variant || "default"
        const defaultConfig = VARIANT_CONFIG[variant] || VARIANT_CONFIG.default
        const textColor = stat.colorClass || defaultConfig.text
        const bgContainer = stat.bgClass || defaultConfig.bg

        const Icon = stat.icon

        return (
          <div
            key={stat.id || stat.label || idx}
            onClick={stat.onClick}
            className={`flex items-center justify-between p-5 rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm transition-all duration-200 ${
              stat.onClick
                ? "cursor-pointer hover:border-primary/40 hover:bg-card/90 hover:scale-[1.01]"
                : ""
            }`}
          >
            <div className="space-y-1 text-left">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
              <p className={`text-3xl font-bold ${textColor}`}>{stat.value}</p>
              {stat.description && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.description}</p>
              )}
            </div>

            {Icon && (
              <div className={`p-3 rounded-xl shrink-0 ${bgContainer}`}>
                {React.isValidElement(Icon)
                  ? Icon
                  : React.createElement(Icon as React.ComponentType<{ size?: number }>, {
                      size: 22,
                    })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StatsHUD
