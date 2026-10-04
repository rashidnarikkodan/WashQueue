import React from "react"
import type { LucideIcon } from "lucide-react"

interface ChartContainerProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
  isLoading?: boolean
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  icon: Icon,
  children,
  action,
  className = "",
  isLoading = false,
}) => {
  return (
    <div
      className={`rounded-2xl border border-border/80 bg-card/65 backdrop-blur-sm p-5 sm:p-6 shadow-sm flex flex-col transition-all ${className}`}
    >
      <div className="flex items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="flex-1 min-h-[260px] w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card/40 backdrop-blur-xs rounded-xl">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground font-medium">
                Loading visualization...
              </span>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

export default ChartContainer
