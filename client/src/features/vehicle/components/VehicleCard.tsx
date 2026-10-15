import { Check } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { Vehicle } from "../types"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"

const DEFAULT_CAR_IMAGE =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"

type Props = {
  vehicle: Vehicle
  image?: string
  className?: string
  categoryName?: string
  isSelected?: boolean
  onSelect?: (vehicle: Vehicle) => void
  selectable?: boolean
  showActions?: boolean
  showSpecs?: boolean
  isAvailable?: boolean
  unavailabilityReason?: string
}

const VehicleCard = ({
  vehicle,
  image,
  categoryName,
  className,
  isSelected,
  onSelect,
  selectable = false,
  showActions = true,
  showSpecs = true,
  isAvailable = true,
  unavailabilityReason,
}: Props) => {
  const navigate = useNavigate()
  const displayImage = image || vehicle.image?.url || DEFAULT_CAR_IMAGE
  const displayCategory = categoryName
  const displayClass = className

  const handleCardClick = () => {
    if (!isAvailable) return
    if (selectable && onSelect) {
      onSelect(vehicle)
    }
  }

  return (
    <div
      key={vehicle.id}
      onClick={handleCardClick}
      className={`relative bg-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs sm:shadow-2xl flex flex-col justify-between group transition-all duration-300 ${
        !isAvailable
          ? "opacity-75 cursor-not-allowed border border-border"
          : selectable
            ? "cursor-pointer"
            : ""
      } ${
        isAvailable && isSelected
          ? "border-2 border-primary shadow-primary/20 scale-[1.01]"
          : isAvailable
            ? "border border-border hover:border-primary/50"
            : ""
      }`}
    >
      {!isAvailable && (
        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 sm:p-4 text-center cursor-not-allowed">
          <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-xs sm:shadow-md">
            Class Not Serviced
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground mt-1 sm:mt-1.5 max-w-[200px] leading-snug">
            {unavailabilityReason || "This station does not support this vehicle class"}
          </span>
        </div>
      )}
      <div className="h-36 sm:h-56 relative overflow-hidden bg-muted">
        <img
          src={displayImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <span className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-xs sm:shadow-md bg-emerald-500/25 text-emerald-400 border border-emerald-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Good Condition
        </span>

        <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 flex items-center gap-1.5 sm:gap-2">
          {isSelected && (
            <span className="bg-primary text-primary-foreground p-1 sm:p-1.5 rounded-full shadow-md flex items-center justify-center">
              <Check size={12} className="stroke-[3] sm:w-3.5 sm:h-3.5" />
            </span>
          )}
          {vehicle.isPrimary && (
            <span className="bg-primary/10 text-primary border border-primary/20 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-xs sm:shadow-md">
              PRIMARY
            </span>
          )}
        </div>
      </div>

      <div className="p-3.5 sm:p-6 space-y-3 sm:space-y-6 flex-grow flex flex-col justify-between">
        <div className="space-y-2.5 sm:space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base sm:text-xl font-extrabold text-foreground">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-mono mt-0.5 tracking-wider">
                {vehicle.registrationNumber || "N/A"}
              </p>
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              {displayCategory && (
                <span className="bg-muted/80 text-muted-foreground text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md tracking-wider">
                  {displayCategory.toUpperCase()}
                </span>
              )}
              {displayClass && (
                <span className="bg-muted/80 text-muted-foreground text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md tracking-wider">
                  {displayClass.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {showSpecs && (
            <div className="grid grid-cols-2 gap-y-2 sm:gap-y-4 gap-x-2 border-t border-border pt-2.5 sm:pt-4">
              <div>
                <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  Model Year
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground">{vehicle.year}</span>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  Last Wash
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground">N/A</span>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  Next Wash
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400">In 14 Days</span>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  Usage
                </span>
                <span className="text-xs sm:text-sm font-bold text-foreground">Daily</span>
              </div>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-6">
            <button
              type="button"
              onClick={() => navigate(APP_ROUTES.VEHICLES.DETAILS(vehicle.id))}
              className="flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground font-extrabold text-xs tracking-wider transition-all cursor-pointer text-center"
            >
              View Details
            </button>
            <button
              type="button"
              onClick={() => navigate("/stations")}
              className="flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-xs sm:shadow-md shadow-primary/10 text-center"
            >
              Book Wash
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VehicleCard
