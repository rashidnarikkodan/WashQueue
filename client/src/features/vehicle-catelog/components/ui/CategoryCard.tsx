import type React from "react"
import { Pencil, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Car, Bike, Truck, Wrench } from "lucide-react"
import type { VehicleCategory } from "../../types"

// Helper to assign icons based on category name (inherits text color)
const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase()
  if (lower.includes("car") || lower.includes("passenger") || lower.includes("auto")) {
    return <Car size={20} />
  }
  if (lower.includes("two") || lower.includes("bike") || lower.includes("cycle") || lower.includes("moto")) {
    return <Bike size={20} />
  }
  if (lower.includes("truck") || lower.includes("lorry") || lower.includes("cargo") || lower.includes("commercial")) {
    return <Truck size={20} />
  }
  if (lower.includes("heavy") || lower.includes("construction") || lower.includes("equip") || lower.includes("mine") || lower.includes("mach")) {
    return <Wrench size={20} />
  }
  return <Car size={20} />
}

// Helper descriptions matching figma mockup
const getCategoryDescription = (name: string) => {
  const lower = name.toLowerCase()
  if (lower.includes("car") || lower.includes("passenger")) {
    return "Standard four-wheeled vehicles for personal transport."
  }
  if (lower.includes("two") || lower.includes("bike")) {
    return "Two-wheeled vehicles such as motorcycles, scooters, and bicycles."
  }
  if (lower.includes("truck") || lower.includes("commercial")) {
    return "Medium-to-large cargo, logistic commercial, and utility transport."
  }
  if (lower.includes("heavy") || lower.includes("construction")) {
    return "Industrial, mining, construction, or heavy duty machinery."
  }
  return "Custom taxonomy category for unique vehicle processing."
}

interface CategoryCardProps {
  category: VehicleCategory
  catClassesCount: number
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit: (cat: VehicleCategory, e: React.MouseEvent) => void
  onDelete: (cat: VehicleCategory, e: React.MouseEvent) => void
  onToggleStatus: (cat: VehicleCategory, e: React.MouseEvent) => void
}

export default function CategoryCard({
  category,
  catClassesCount,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleStatus,
}: CategoryCardProps) {
  return (
    <div
      onClick={onToggleExpand}
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-3xl border shadow-lg cursor-pointer hover:border-primary/40 transition-all duration-200 select-none ${
        category.isActive
          ? "border-l-[5px] border-l-primary border-y-border border-r-border bg-card hover:bg-card/90"
          : "border-l-[5px] border-l-muted-foreground border-y-border border-r-border bg-muted/30 opacity-60 hover:opacity-80"
      }`}
    >
      <div className="flex items-center gap-5 min-w-0 flex-1">
        {/* Icon Box */}
        <div
          className={`flex w-12 h-12 justify-center items-center rounded-xl shrink-0 transition-all duration-200 ${
            category.isActive
              ? "bg-primary/10 border border-primary/20 text-primary"
              : "bg-muted border border-border text-muted-foreground"
          }`}
        >
          {getCategoryIcon(category.name)}
        </div>

        <div className="flex flex-col gap-1 text-left min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3
              className={`text-lg font-bold tracking-wide transition-colors break-words ${
                category.isActive ? "text-foreground" : "text-muted-foreground line-through"
              }`}
            >
              {category.name}
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-extrabold uppercase tracking-wide border border-primary/20 shrink-0">
              {catClassesCount} {catClassesCount === 1 ? "Class" : "Classes"}
            </span>

            {/* Status Badge */}
            <span
              className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border shrink-0 ${
                category.isActive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {category.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p
            className={`text-xs leading-normal transition-colors break-words ${
              category.isActive ? "text-muted-foreground" : "text-muted-foreground/70"
            }`}
          >
            {category.description || getCategoryDescription(category.name)}
          </p>
        </div>
      </div>

      {/* Actions & Chevron */}
      <div className="flex items-center gap-2.5 mt-4 sm:mt-0 self-end sm:self-center shrink-0">
        {/* Status Toggle (Eye/EyeOff) */}
        <button
          onClick={(e) => onToggleStatus(category, e)}
          title={category.isActive ? "Deactivate Category" : "Activate Category"}
          className="p-2.5 rounded-xl border border-border bg-muted/30 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-muted transition-all cursor-pointer shrink-0"
        >
          {category.isActive ? (
            <div className="flex items-center gap-2">
              <span>Deactivate</span>
              <EyeOff size={14} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Activate</span>
              <Eye size={14} />
            </div>
          )}
        </button>

        {/* Pencil Icon (Edit Category) */}
        <button
          onClick={(e) => onEdit(category, e)}
          title="Edit Category"
          className="p-2.5 rounded-xl border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted transition-all cursor-pointer shrink-0"
        >
          <Pencil size={14} />
        </button>

        {/* Trash Icon (Delete Category) */}
        <button
          onClick={(e) => onDelete(category, e)}
          title="Delete Category"
          className="p-2.5 rounded-xl border border-red-500/10 bg-red-500/5 text-red-400 hover:text-white hover:border-red-500/30 hover:bg-red-600 transition-all cursor-pointer shrink-0"
        >
          <Trash2 size={14} />
        </button>

        {/* Chevron (Toggle Expanded) */}
        <div className="p-2.5 rounded-xl border border-border bg-muted/20 text-muted-foreground hover:text-foreground transition-all ml-1 shrink-0">
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>
    </div>
  )
}
