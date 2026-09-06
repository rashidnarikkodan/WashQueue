import type React from "react"
import { Plus } from "lucide-react"

interface AddClassPlaceholderCardProps {
  categoryId: string
  classesCount: number
  onAddClass: (categoryId: string, e: React.MouseEvent) => void
}

export default function AddClassPlaceholderCard({
  categoryId,
  classesCount,
  onAddClass,
}: AddClassPlaceholderCardProps) {
  return (
    <div
      onClick={(e) => onAddClass(categoryId, e)}
      className="relative flex flex-col justify-center pl-10 min-h-[56px] group"
    >
      {classesCount === 0 && (
        <div className="absolute left-[16px] top-[-16px] h-[16px] w-[2px] bg-slate-800/80"></div>
      )}

      <div className="absolute left-[16px] top-0 w-[24px] h-[28px] border-l-2 border-b-2 border-slate-800/80 rounded-bl-xl"></div>

      <div className="flex items-center justify-center p-4 rounded-3xl border border-dashed border-slate-800/60 bg-[#151B2D]/40 hover:bg-[#1a2136]/50 hover:border-[#ADC6FF]/50 text-slate-500 hover:text-[#ADC6FF] transition-all duration-200 shadow-sm cursor-pointer select-none">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
          <Plus size={14} className="group-hover:scale-110 transition-transform duration-200" />
          <span>Add Class...</span>
        </div>
      </div>
    </div>
  )
}
