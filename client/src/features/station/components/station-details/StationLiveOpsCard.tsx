import { User } from "lucide-react"
import type { Station } from "../../types"

interface StationLiveOpsCardProps {
  station: Station
}

export default function StationLiveOpsCard({ station }: StationLiveOpsCardProps) {
  const baysCount = station.slotConfig?.bays || 3

  const baysList = Array.from({ length: Math.max(3, baysCount) }).map((_, i) => ({
    name: `Bay 0${i + 1} - ${i === 0 ? "Express" : i === 1 ? "Premium" : "Detail"}`,
    isActive: i < Math.ceil(baysCount * 0.7),
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-[#2e3447]/30 backdrop-blur-xl p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white">Bay Status</h3>
          <span className="px-2 py-0.5 bg-[#4ae176]/10 text-[#4ae176] text-[10px] font-bold rounded uppercase">
            LIVE
          </span>
        </div>
        <div className="space-y-3">
          {baysList.map((bay, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-[#2e3447] p-3 rounded-xl border border-white/5"
            >
              <span className="text-xs font-semibold text-white">{bay.name}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  bay.isActive ? "bg-[#4ae176]/15 text-[#4ae176]" : "bg-slate-800 text-slate-400"
                }`}
              >
                {bay.isActive ? "ACTIVE" : "IDLE"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#2e3447]/30 backdrop-blur-xl p-6 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-4">Queue Intel</h3>
          <div className="flex items-end gap-2 mb-3">
            <div className="text-4xl font-black text-[#dce1fb]">18m</div>
            <div className="text-xs text-[#c2c6d6] mb-1">Current Wait</div>
          </div>
          <div className="w-full bg-[#2e3447] h-2.5 rounded-full overflow-hidden">
            <div className="bg-[#adc6ff] h-full w-[65%] rounded-full"></div>
          </div>
        </div>
        <p className="text-xs text-[#8c909f]">Volume is 15% higher than typical Tuesdays.</p>
      </div>

      <div className="bg-[#2e3447]/30 backdrop-blur-xl p-6 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-4">Staffing</h3>
          <div className="flex -space-x-2 mb-4">
            <div className="w-9 h-9 rounded-full border-2 border-[#0c1324] bg-[#2e3447] text-[#adc6ff] flex items-center justify-center font-bold text-xs">
              <User size={16} />
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-[#0c1324] bg-[#2e3447] text-[#adc6ff] flex items-center justify-center font-bold text-xs">
              <User size={16} />
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-[#0c1324] bg-[#2e3447] text-[#adc6ff] flex items-center justify-center font-bold text-xs">
              <User size={16} />
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-[#0c1324] bg-[#2e3447] text-white flex items-center justify-center text-[10px] font-bold">
              +2
            </div>
          </div>
        </div>
        <button
          type="button"
          className="w-full py-2 border border-slate-700/60 hover:border-slate-500 text-xs font-semibold text-white rounded-xl hover:bg-white/5 transition-all cursor-pointer"
        >
          Manage Shifts
        </button>
      </div>
    </div>
  )
}
