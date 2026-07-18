import type React from "react"
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import type { VehicleClass } from "../../types"

interface ClassCardProps {
  cls: VehicleClass
  index: number
  onEdit: (cls: VehicleClass, e: React.MouseEvent) => void
  onDelete: (cls: VehicleClass, e: React.MouseEvent) => void
  onToggleStatus: (cls: VehicleClass, e: React.MouseEvent) => void
}

export default function ClassCard({
  cls,
  index,
  onEdit,
  onDelete,
  onToggleStatus,
}: ClassCardProps) {
  return (
    <div className="relative flex flex-col justify-center pl-10 min-h-[56px]">
      {/* Connect parent category bottom line to the first child's curve top */}
      {index === 0 && (
        <div className="absolute left-[16px] top-[-16px] h-[16px] w-[2px] bg-slate-800/80"></div>
      )}

      {/* Continuation line to subsequent children (always true because placeholder follows) */}
      <div className="absolute left-[16px] top-0 -bottom-4 w-[2px] bg-slate-800/80"></div>

      {/* L-shaped curved line */}
      <div className="absolute left-[16px] top-0 w-[24px] h-[28px] border-l-2 border-b-2 border-slate-800/80 rounded-bl-xl"></div>

      {/* Class Content Card */}
      <div className={`flex items-center justify-between p-4 rounded-3xl border transition-all duration-200 shadow-sm ${
        cls.isActive
          ? "border-l-[4px] border-l-[#ADC6FF]/50 border-y-slate-900 border-r-slate-900 bg-[#151B2D] hover:bg-[#1a2136] hover:border-slate-800"
          : "border-l-[4px] border-l-slate-700 border-y-slate-950 border-r-slate-950 bg-[#111422] opacity-55 hover:opacity-75"
      }`}>
        <div className="flex items-center gap-4 text-left min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <h4 className={`text-sm font-bold leading-snug break-words ${
              cls.isActive ? "text-slate-100" : "text-slate-500 line-through"
            }`}>
              {cls.name}
            </h4>
            <div className="flex flex-wrap items-center gap-3 mt-0.5 min-w-0">
              <span className={`text-[10px] font-medium font-mono break-all ${
                cls.isActive ? "text-slate-400" : "text-slate-600"
              }`}>
                Class Code: {cls.slug}
              </span>
              
              {/* Status Badge */}
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border shrink-0 ${
                cls.isActive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}>
                {cls.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {cls.description && (
              <p className={`text-xs mt-1.5 break-words transition-colors ${
                cls.isActive ? "text-slate-400" : "text-slate-600"
              }`}>
                {cls.description}
              </p>
            )}
          </div>
        </div>

        {/* Class Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {/* Status Toggle (Eye/EyeOff) */}
          <button
            onClick={(e) => onToggleStatus(cls, e)}
            title={cls.isActive ? "Deactivate Class" : "Activate Class"}
            className="p-2 rounded-xl border border-slate-800 bg-[#2E3447]/30 text-slate-400 hover:text-[#ADC6FF] hover:border-[#ADC6FF]/35 hover:bg-[#2E3447] transition-all cursor-pointer"
          >
            {cls.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>

          <button
            onClick={(e) => onEdit(cls, e)}
            title="Edit Sub-class"
            className="p-2 rounded-xl border border-slate-800 bg-[#2E3447]/30 text-slate-400 hover:text-slate-100 hover:bg-[#2E3447] hover:border-slate-700 transition-all cursor-pointer"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e) => onDelete(cls, e)}
            title="Delete Sub-class"
            className="p-2 rounded-xl border border-red-500/10 bg-red-500/5 text-red-400 hover:text-white hover:bg-red-600 hover:border-red-500/30 transition-all cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
