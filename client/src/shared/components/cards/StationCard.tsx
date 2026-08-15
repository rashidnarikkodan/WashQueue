import React, { useState } from "react"
import { ImageOff, MapPin, Star, Heart } from "lucide-react"
import { StationStatus, STATION_STATUS } from "@/features/station/types"
import { usersApi } from "@/shared/apis/users.api"

export interface StationCardProps {
  id: string
  name: string
  image: string
  address: string
  status: StationStatus
  rating: number
  reviewCount: number
  queueCount: number
  baysCount: number
  operatingHours?: string
  services?: string[]
  categories?: string[]
  distanceKm?: number
  startingPrice?: number
  halfWashPrice?: number
  fullWashPrice?: number
  selectedVehicleName?: string
  isFavorite?: boolean
  showFavoriteButton?: boolean
  primaryActionLabel?: string
  onClick?: () => void
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
  // Return `false` (or reject) to tell the card its optimistic toggle failed and should
  // revert; returning `true`/`undefined` is treated as success.
  onFavoriteToggle?: (id: string) => void | boolean | Promise<void | boolean>
}

const STATUS_CONFIG: Record<
  StationStatus,
  { bg: string; dot: string; text: string; label: string }
> = {
  [STATION_STATUS.ACTIVE]: {
    bg: "bg-emerald-600/50 border-emerald-600/30",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    label: "Active",
  },
  [STATION_STATUS.INACTIVE]: {
    bg: "bg-muted/80 border-border",
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
    label: "Inactive",
  },
  [STATION_STATUS.DRAFT]: {
    bg: "bg-blue-600/50 border-blue-500/30",
    dot: "bg-blue-400",
    text: "text-blue-400",
    label: "Draft",
  },
  [STATION_STATUS.PENDING_REVIEW]: {
    bg: "bg-amber-500/20 border-amber-500/30",
    dot: "bg-amber-400",
    text: "text-amber-300",
    label: "Pending Review",
  },
  [STATION_STATUS.SUSPENDED]: {
    bg: "bg-orange-500/20 border-orange-500/30",
    dot: "bg-orange-400",
    text: "text-orange-300",
    label: "Suspended",
  },
  [STATION_STATUS.REJECTED]: {
    bg: "bg-red-500/20 border-red-500/30",
    dot: "bg-red-400",
    text: "text-red-300",
    label: "Rejected",
  },
}

const StationCard: React.FC<StationCardProps> = ({
  id,
  name,
  image,
  address,
  status,
  rating,
  reviewCount,
  queueCount,
  baysCount,
  services = [],
  categories = ["Car", "Bike", "SUV"],
  distanceKm,
  halfWashPrice,
  fullWashPrice,
  selectedVehicleName,
  isFavorite = false,
  showFavoriteButton = true,
  primaryActionLabel,
  onClick,
  onPrimaryAction,
  onSecondaryAction,
  onFavoriteToggle,
}) => {
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["DRAFT"]
  const [imgError, setImgError] = useState(false)
  const [favoriteOverride, setFavoriteOverride] = useState<boolean | null>(null)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const favorite = favoriteOverride ?? isFavorite

  const hasValidImage = image && !image.includes("placehold") && image !== "No Image" && !imgError

  const handleFavClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isTogglingFavorite) return // guard against double-click firing overlapping requests
    const nextVal = !favorite
    setFavoriteOverride(nextVal)
    setIsTogglingFavorite(true)
    try {
      if (onFavoriteToggle) {
        const result = await onFavoriteToggle(id)
        if (result === false) setFavoriteOverride(!nextVal)
      } else {
        await usersApi.toggleBookmark(id)
      }
    } catch {
      setFavoriteOverride(!nextVal)
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  const getActionButtonConfig = () => {
    if (primaryActionLabel) {
      return {
        label: primaryActionLabel,
        className: "bg-primary hover:opacity-90 text-primary-foreground font-semibold shadow-md",
      }
    }

    switch (status) {
      case STATION_STATUS.REJECTED:
        return {
          label: "Edit & Retry Application",
          className: "bg-red-500 hover:bg-red-600 text-white font-semibold shadow-red-500/20",
        }
      case STATION_STATUS.DRAFT:
        return {
          label: "Continue Setup",
          className: "bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-blue-500/20",
        }
      case STATION_STATUS.PENDING_REVIEW:
        return {
          label: "Pending Admin Review",
          className: "bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold",
        }
      default:
        return {
          label: "Manage Station",
          className: "bg-primary hover:opacity-90 text-primary-foreground font-semibold shadow-md",
        }
    }
  }

  const actionBtn = getActionButtonConfig()
  const servicesText =
    services.length > 0 ? services.slice(0, 3).join(" • ") : "Exterior • Interior • Polish"
  const categoriesText =
    categories.length > 0 ? categories.slice(0, 3).join(" • ") : "Car • Bike • SUV"

  return (
    <div
      onClick={onClick}
      className="group flex flex-col rounded-3xl bg-card border border-border shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all duration-300 overflow-hidden relative w-full cursor-pointer"
    >
      {/* Image Header & Badges */}
      <div className="relative h-48 w-full overflow-hidden shrink-0 bg-muted">
        {hasValidImage ? (
          <img
            src={image}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/60">
            <ImageOff size={32} className="opacity-50" />
            <span className="text-xs font-bold tracking-wide uppercase opacity-70">No Image</span>
          </div>
        )}

        {/* Status Badge (Top-Left) */}
        <div
          className={`absolute top-3.5 left-3.5 flex items-center px-3 py-1 gap-1.5 ${statusCfg.bg} backdrop-blur-md rounded-full border shadow-sm z-10`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} animate-pulse`} />
          <span className={`${statusCfg.text} text-[10px] font-bold tracking-wider uppercase`}>
            {statusCfg.label}
          </span>
        </div>

        {/* Favorite Heart Button (Top-Right) */}
        {showFavoriteButton && (
          <button
            onClick={handleFavClick}
            disabled={isTogglingFavorite}
            className={`absolute top-3.5 right-3.5 flex items-center justify-center w-9 h-9 rounded-full border backdrop-blur-md transition-all duration-200 z-10 disabled:opacity-60 disabled:cursor-not-allowed ${
              favorite
                ? "bg-rose-500/20 border-rose-500/40 text-rose-500"
                : "bg-card/70 border-border text-muted-foreground hover:text-foreground hover:bg-card"
            }`}
            aria-label="Toggle Favorite"
          >
            <Heart className={`w-4 h-4 ${favorite ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col justify-between p-5 gap-3 flex-1">
        {/* Title & Rating */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-foreground text-lg font-bold leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="text-amber-400 text-xs font-bold">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-[10px]">
              ({reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
            </span>
          </div>
        </div>

        {/* Location & Distance */}
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs leading-tight">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="line-clamp-1">
            {address}
            {distanceKm !== undefined ? ` • ${distanceKm.toFixed(1)} km away` : ""}
          </span>
        </div>

        {/* Minimal Vehicle Specific Pricing (Only shown when vehicle filter is active) */}
        {selectedVehicleName && (halfWashPrice !== undefined || fullWashPrice !== undefined) && (
          <div className="flex items-center justify-between py-1.5 px-1 border-y border-border/50">
            {/* Left side: Half Wash Rate */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Half
              </span>
              <span className="text-base sm:text-lg font-black text-blue-400">
                ${halfWashPrice ?? "—"}
              </span>
            </div>

            {/* Subtle Divider Dot */}
            <div className="w-1 h-1 rounded-full bg-border" />

            {/* Right side: Full Wash Rate */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Full
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-400">
                ${fullWashPrice ?? "—"}
              </span>
            </div>
          </div>
        )}

        {/* Live Ops Info (Bays & Queue Stats - Minimal Line) */}
        <div className="flex items-center justify-between text-xs py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-foreground font-semibold text-xs">
              {baysCount > 0 ? `${baysCount} Bays` : "Bays N/A"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse" />
            <span>{queueCount} in queue</span>
          </div>
        </div>

        {/* Services & Categories Summary */}
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          <p className="line-clamp-1 font-medium text-muted-foreground/90">{servicesText}</p>
          <p className="line-clamp-1 text-[11px] text-muted-foreground/75">{categoriesText}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto pt-1">
          {onPrimaryAction && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onPrimaryAction) {
                  onPrimaryAction()
                } else {
                  onClick?.()
                }
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer select-none ${actionBtn.className}`}
            >
              {actionBtn.label}
            </button>
          )}
          {onSecondaryAction && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSecondaryAction()
              }}
              className="w-full py-2 px-4 bg-muted hover:bg-muted/80 rounded-xl text-foreground text-xs font-semibold text-center transition-all cursor-pointer select-none"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default StationCard
