import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react"
import VehicleCard from "./VehicleCard"
import type { Vehicle } from "../types"

export interface VehicleCarouselProps {
  vehicles: Vehicle[]
  isLoading?: boolean
  isActionLoading?: boolean
  onSetPrimary?: (id: string) => void
  onDelete?: (id: string) => void
  onBookWash?: (vehicle: Vehicle) => void
  onAddClick?: () => void
}

export default function VehicleCarousel({
  vehicles,
  isLoading = false,
  isActionLoading = false,
  onSetPrimary,
  onDelete,
  onBookWash,
  onAddClick,
}: VehicleCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
      setShowLeftArrow(scrollLeft > 10)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [vehicles])

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current
      const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-semibold tracking-wider">Accessing Digital Garage...</p>
      </div>
    )
  }

  return (
    <div className="relative group/carousel w-full">
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 pt-2 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Vehicles */}
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="snap-start shrink-0 w-[290px] sm:w-[320px] md:w-[340px]"
          >
            <VehicleCard
              vehicle={vehicle}
              onSetPrimary={onSetPrimary}
              onDelete={onDelete}
              onBookWash={onBookWash}
              isActionLoading={isActionLoading}
            />
          </div>
        ))}

        {/* Quick Actions Add Card */}
        {onAddClick && (
          <div className="snap-start shrink-0 w-[290px] sm:w-[320px] md:w-[340px]">
            <button
              onClick={onAddClick}
              className="w-full h-full border-2 border-dashed border-border hover:border-primary/40 rounded-3xl p-6 flex flex-col justify-center items-center text-center gap-4 transition-all duration-300 min-h-[300px] bg-card/50 hover:bg-card cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center border border-border text-muted-foreground group-hover/carousel:scale-105 transition-transform duration-300">
                <Plus size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Add New Vehicle</h3>
                <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed font-medium">
                  Register new premium cars or SUVs into your digital garage for detention detailing.
                </p>
              </div>
              <span className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground font-extrabold text-xs tracking-wider transition-all">
                Register Vehicle
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-[40%] -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 border border-border shadow-xl hover:bg-card flex items-center justify-center text-foreground hover:text-primary transition-all z-20 cursor-pointer backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-[40%] -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 border border-border shadow-xl hover:bg-card flex items-center justify-center text-foreground hover:text-primary transition-all z-20 cursor-pointer backdrop-blur-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
