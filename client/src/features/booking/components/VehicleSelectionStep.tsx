import { Plus, Car, Check } from "lucide-react"
import type { Vehicle } from "@/features/vehicle/types"

interface VehicleSelectionStepProps {
  vehicles: Vehicle[]
  selectedVehicleId: string | null
  onSelectVehicle: (id: string) => void
  onAddVehicle: () => void
  isLoading?: boolean
}

const DEFAULT_CAR_IMAGE =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"

export default function VehicleSelectionStep({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onAddVehicle,
  isLoading,
}: VehicleSelectionStepProps) {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shrink-0 shadow-md shadow-primary/20">
            1
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Vehicle Selection
          </h2>
        </div>

        <button
          type="button"
          onClick={onAddVehicle}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/80 transition-all cursor-pointer shadow-xs active:scale-98"
        >
          <Plus size={16} />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Vehicles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 rounded-3xl bg-muted/40 border border-border animate-pulse"
            />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border bg-card text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Car size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No Vehicles Added Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Add your vehicle to quickly select it for slot booking and service queueing.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddVehicle}
            className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:bg-primary/90 transition-all cursor-pointer"
          >
            + Add First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full">
          {vehicles.map((v) => {
            const isSelected = selectedVehicleId === v.id
            const imgUrl = v.image?.url || DEFAULT_CAR_IMAGE

            return (
              <div
                key={v.id}
                onClick={() => onSelectVehicle(v.id)}
                className={`group relative flex flex-col justify-between rounded-3xl cursor-pointer transition-all duration-300 overflow-hidden text-left ${
                  isSelected
                    ? "border-2 border-primary bg-card shadow-2xl shadow-primary/10 scale-[1.01]"
                    : "border border-border bg-card hover:border-primary/50 shadow-md"
                }`}
              >
                {/* Image Section */}
                <div className="h-44 relative overflow-hidden bg-muted">
                  <img
                    src={imgUrl}
                    alt={v.nickname || `${v.brand} ${v.model}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    {v.isPrimary ? (
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 backdrop-blur-md shadow-md">
                        PRIMARY
                      </span>
                    ) : (
                      <span />
                    )}

                    {isSelected && (
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/40">
                        <Check size={16} className="stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Details Section */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-foreground truncate">
                      {v.nickname || `${v.brand} ${v.model}`}
                    </h3>
                    <p className="font-mono text-xs text-muted-foreground font-semibold tracking-wider">
                      {v.registrationNumber || `${v.brand} ${v.model}`}
                    </p>
                  </div>

                  {/* Technical & Category Chips */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-muted-foreground bg-muted uppercase tracking-wider">
                      {v.brand}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-muted-foreground bg-muted uppercase tracking-wider">
                      {v.model}
                    </span>
                  </div>

                  {/* Selection Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectVehicle(v.id)
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border"
                    }`}
                  >
                    {isSelected ? "Selected Vehicle" : "Select Vehicle"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

