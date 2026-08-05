import { Plus, Car } from "lucide-react"
import type { Vehicle } from "@/features/vehicle/types"
import VehicleCard from "@/features/vehicle/components/VehicleCard"

interface VehicleSelectionStepProps {
  vehicles: Vehicle[]
  selectedVehicleId: string | null
  onSelectVehicle: (id: string) => void
  onAddVehicle: () => void
  isLoading?: boolean
}

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
            return (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isSelected={isSelected}
                onSelect={() => onSelectVehicle(v.id)}
                selectable
                showActions={false}
                showSpecs={false}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

