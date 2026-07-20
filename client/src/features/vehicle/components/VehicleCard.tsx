import { Star, Trash2, Calendar, Hash, Tag, Layers } from "lucide-react"
import type { Vehicle } from "../types"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/vehicleCatelogStore"
import { useEffect } from "react"

export interface VehicleCardProps {
  vehicle: Vehicle
  onSetPrimary?: (id: string) => void
  onDelete?: (id: string) => void
  onBookWash?: (vehicle: Vehicle) => void
  isActionLoading?: boolean
}

export default function VehicleCard({
  vehicle,
  onSetPrimary,
  onDelete,
  onBookWash,
  isActionLoading = false,
}: VehicleCardProps) {
  const { categories, classes, loadData } = useVehicleCatelogStore()

  useEffect(() => {
    if (categories.length === 0 || classes.length === 0) {
      loadData()
    }
  }, [categories.length, classes.length, loadData])

  const categoryName = categories.find((c) => c.id === vehicle.categoryId)?.name || "Category"
  const className = classes.find((c) => c.id === vehicle.classId)?.name || "Class"

  return (
    <div className="bg-card border border-border rounded-3xl p-6 flex flex-col justify-between group hover:border-primary/30 transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden min-h-[300px] w-full text-left">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-primary/80 uppercase tracking-widest bg-primary/5 border border-primary/10 px-2 py-0.5 rounded">
              {vehicle.nickname}
            </span>
            <h3 className="text-lg md:text-xl font-black text-foreground mt-2 truncate max-w-[180px] md:max-w-[200px]">
              {vehicle.brand} {vehicle.model}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {vehicle.isPrimary ? (
              <span className="flex items-center gap-1 bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/25 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm">
                <Star className="w-3 h-3 fill-amber-500" />
                PRIMARY
              </span>
            ) : (
              onSetPrimary && (
                <button
                  onClick={() => onSetPrimary(vehicle.id)}
                  disabled={isActionLoading}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Set as Primary"
                >
                  <Star className="w-4 h-4" />
                </button>
              )
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(vehicle.id)}
                disabled={isActionLoading}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                title="Remove Vehicle"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                Model Year
              </span>
              <span className="text-xs font-bold text-foreground">{vehicle.year}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                Reg Plate
              </span>
              <span className="text-xs font-bold text-foreground font-mono truncate max-w-[90px]">
                {vehicle.registrationNumber || "N/A"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                Category
              </span>
              <span className="text-xs font-bold text-foreground truncate max-w-[90px] block">
                {categoryName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">
                Class
              </span>
              <span className="text-xs font-bold text-foreground truncate max-w-[90px] block">
                {className}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 relative z-10">
        <button
          onClick={() => onBookWash?.(vehicle)}
          className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-md shadow-primary/10 flex items-center justify-center gap-2"
        >
          Bookdetailing Wash
        </button>
      </div>
    </div>
  )
}
