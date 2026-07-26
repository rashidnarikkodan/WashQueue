import React from "react"
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  AlertCircle,
  X,
  type LucideIcon,
} from "lucide-react"

export type BannerStatus = "success" | "info" | "warn" | "warning" | "error"

export interface BannerProps {
  status?: BannerStatus
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  badgeText?: string
  icon?: LucideIcon
  action?: React.ReactNode
  onClose?: () => void
  className?: string
}

const variantStyles: Record<
  BannerStatus,
  {
    container: string
    iconBg: string
    iconColor: string
    badge: string
    titleColor: string
    defaultIcon: LucideIcon
  }
> = {
  success: {
    container: "bg-emerald-500/10 border-emerald-500/30",
    iconBg: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    iconColor: "text-emerald-500",
    badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    titleColor: "text-emerald-500",
    defaultIcon: CheckCircle2,
  },
  info: {
    container: "bg-blue-500/10 border-blue-500/30",
    iconBg: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    iconColor: "text-blue-500",
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    titleColor: "text-blue-500",
    defaultIcon: Info,
  },
  warn: {
    container: "bg-amber-700/10 border-amber-500/30",
    iconBg: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    iconColor: "text-amber-500",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    titleColor: "text-amber-500",
    defaultIcon: AlertTriangle,
  },
  warning: {
    container: "bg-amber-700/10 border-amber-500/30",
    iconBg: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    iconColor: "text-amber-500",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    titleColor: "text-amber-500",
    defaultIcon: AlertTriangle,
  },
  error: {
    container: "bg-red-500/10 border-red-500/30",
    iconBg: "bg-red-500/15 text-red-500 border-red-500/30",
    iconColor: "text-red-500",
    badge: "bg-red-500/20 text-red-400 border-red-500/30",
    titleColor: "text-red-500",
    defaultIcon: AlertCircle,
  },
}

export default function Banner({
  status = "info",
  title,
  description,
  children,
  badgeText,
  icon,
  action,
  onClose,
  className = "",
}: BannerProps) {
  const config = variantStyles[status] || variantStyles.info
  const IconComponent = icon || config.defaultIcon

  return (
    <div
      className={`mb-6 p-4 sm:p-5 rounded-2xl border backdrop-blur-md shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300 ${config.container} ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3.5 flex-1">
        {/* Pulsing Icon */}
        <div className="relative shrink-0 mt-0.5 sm:mt-0">
          <div className={`absolute inset-0 rounded-xl blur-md animate-pulse opacity-50 ${config.iconColor}`} />
          <div className={`relative p-2.5 rounded-xl border flex items-center justify-center ${config.iconBg}`}>
            <IconComponent className="w-5 h-5" />
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-1 flex-1">
          {(title || badgeText) && (
            <div className="flex flex-wrap items-center gap-2">
              {title && (
                <h3 className={`text-sm font-bold tracking-tight flex items-center gap-1.5 ${config.titleColor}`}>
                  {title}
                </h3>
              )}
              {badgeText && (
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full border ${config.badge}`}>
                  {badgeText}
                </span>
              )}
            </div>
          )}

          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              {description}
            </p>
          )}

          {children}
        </div>
      </div>

      {/* Optional Action or Close Button */}
      {(action || onClose) && (
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          {action}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
