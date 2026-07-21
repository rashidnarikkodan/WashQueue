import React, { useState } from "react"
import { ImageOff } from "lucide-react"
import { StationStatus, STATION_STATUS } from "@/features/station/types"

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
  operatingHours: string
  services: string[]
  onClick?: () => void
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
}

const STATUS_CONFIG: Record<
  StationStatus,
  { bg: string; dot: string; text: string; label: string }
> = {
  [STATION_STATUS.ACTIVE]: {
    bg: "bg-emerald-500/20",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    label: "Active",
  },
  [STATION_STATUS.INACTIVE]: {
    bg: "bg-slate-500/20",
    dot: "bg-slate-400",
    text: "text-slate-300",
    label: "Inactive",
  },
  [STATION_STATUS.DRAFT]: {
    bg: "bg-blue-500/20",
    dot: "bg-blue-400",
    text: "text-blue-300",
    label: "Draft",
  },
  [STATION_STATUS.PENDING_REVIEW]: {
    bg: "bg-amber-500/20",
    dot: "bg-amber-400",
    text: "text-amber-300",
    label: "Pending Review",
  },
  [STATION_STATUS.SUSPENDED]: {
    bg: "bg-orange-500/20",
    dot: "bg-orange-400",
    text: "text-orange-300",
    label: "Suspended",
  },
  [STATION_STATUS.REJECTED]: {
    bg: "bg-red-500/20",
    dot: "bg-red-400",
    text: "text-red-300",
    label: "Rejected",
  },
}

const StationCard: React.FC<StationCardProps> = ({
  name,
  image,
  address,
  status,
  rating,
  reviewCount,
  queueCount,
  baysCount,
  onClick,
  onPrimaryAction,
  onSecondaryAction,
}) => {
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["DRAFT"]
  const [imgError, setImgError] = useState(false)

  const hasValidImage = image && !image.includes("placehold") && image !== "No Image" && !imgError

  const getActionButtonConfig = () => {
    switch (status) {
      case STATION_STATUS.REJECTED:
        return {
          label: "Edit & Retry Application",
          className: "bg-red-500 hover:bg-red-400 text-white font-bold shadow-red-500/20",
        }
      case STATION_STATUS.DRAFT:
        return {
          label: "Continue Setup",
          className: "bg-blue-500 hover:bg-blue-400 text-white font-bold shadow-blue-500/20",
        }
      case STATION_STATUS.PENDING_REVIEW:
        return {
          label: "Pending Admin Review",
          className: "bg-amber-500/80 hover:bg-amber-500 text-slate-950 font-bold",
        }
      default:
        return {
          label: "Manage Station",
          className: "bg-[#60A5FA] hover:bg-blue-400 text-[#002E6A] font-bold",
        }
    }
  }

  const actionBtn = getActionButtonConfig()

  return (
    <div className="flex flex-col rounded-3xl bg-[#191F31] shadow-2xl overflow-hidden relative w-full max-w-99 mx-auto sm:mx-0">
      {/* Image & Status Badge */}
      <div className="relative h-48 w-full overflow-hidden shrink-0 bg-[#151B2D]">
        {hasValidImage ? (
          <img
            src={image}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#8c909f] bg-[#151B2D]">
            <ImageOff size={32} className="opacity-60" />
            <span className="text-xs font-bold tracking-wide uppercase opacity-75">No Image</span>
          </div>
        )}
        <div
          className={`absolute top-4 right-4 flex items-center px-3 py-1 gap-1.5 ${statusCfg.bg} rounded-full shadow-md z-10 backdrop-blur-sm border border-white/10`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} animate-pulse`} />
          <span className={`${statusCfg.text} text-[10px] font-bold tracking-[1px] uppercase`}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between p-6 h-full grow">
        <div className="flex flex-col gap-4 mb-6">
          {/* Header Row */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <h3 className="text-white text-xl font-semibold leading-tight line-clamp-1">{name}</h3>
              <p className="text-[#C2C6D6] text-sm leading-snug line-clamp-1">{address}</p>
            </div>

            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2.23125 11.0833L3.17917 6.98542L0 4.22917L4.2 3.86458L5.83333 0L7.46667 3.86458L11.6667 4.22917L8.4875 6.98542L9.43542 11.0833L5.83333 8.91042L2.23125 11.0833Z"
                  fill="#ADC6FF"
                />
              </svg>
              <span className="text-[#ADC6FF] text-sm font-bold leading-5">{rating.toFixed(1)}</span>
              <span className="text-[#C2C6D6] text-[10px] leading-3 ml-0.5">
                ({reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 p-3 bg-[#151B2D] rounded-xl border border-transparent hover:border-blue-500/10 transition-colors">
              <span className="text-[#C2C6D6] text-[10px] font-semibold tracking-[1px] uppercase">Bays</span>
              <div className="flex items-center h-8">
                <span className="text-white text-xl font-bold">{baysCount || "—"}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-[#151B2D] rounded-xl border border-transparent hover:border-blue-500/10 transition-colors">
              <span className="text-[#C2C6D6] text-[10px] font-semibold tracking-[1px] uppercase">Queue</span>
              <div className="flex items-center h-8 gap-2">
                <span className="text-white text-2xl font-bold">{queueCount}</span>
                <span className="text-[#C2C6D6] text-xs font-medium">Vehicles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-auto">
          <button
            onClick={onPrimaryAction || onClick}
            className={`w-full py-3 rounded-xl text-sm text-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md cursor-pointer select-none ${actionBtn.className}`}
          >
            {actionBtn.label}
          </button>
          <button
            onClick={onSecondaryAction || onClick}
            className="w-full py-3 bg-[#60A5FA]/10 hover:bg-[#60A5FA]/20 rounded-xl text-[#AEB9D0] text-sm font-bold text-center hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer select-none"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default StationCard
