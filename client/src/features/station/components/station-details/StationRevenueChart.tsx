import { useState } from "react"

export default function StationRevenueChart() {
  const [filter, setFilter] = useState<"D" | "W" | "M">("D")

  const bars = [
    { height: "40%", amount: "$1.2k" },
    { height: "65%", amount: "$1.8k" },
    { height: "45%", amount: "$1.3k" },
    { height: "90%", amount: "$2.9k" },
    { height: "55%", amount: "$1.6k" },
    { height: "35%", amount: "$980" },
    { height: "75%", amount: "$2.2k" },
  ]

  return (
    <div className="bg-[#151b2d] p-8 sm:p-10 rounded-2xl border border-white/5 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#dce1fb] tracking-tight">
            Revenue Velocity
          </h2>
          <p className="text-sm text-[#c2c6d6] opacity-80 mt-1">
            Real-time performance across service tiers
          </p>
        </div>

        <div className="flex gap-2 bg-[#2e3447] p-1 rounded-xl">
          {(["D", "W", "M"] as const).map((btn) => (
            <button
              key={btn}
              type="button"
              onClick={() => setFilter(btn)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filter === btn
                  ? "bg-[#adc6ff] text-[#002e6a] shadow-sm"
                  : "text-[#c2c6d6] hover:text-white"
              }`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 flex items-end gap-3 sm:gap-4 pt-6">
        {bars.map((bar, idx) => (
          <div
            key={idx}
            style={{ height: bar.height }}
            className="flex-1 bg-[#adc6ff]/20 hover:bg-[#adc6ff] rounded-t-xl transition-all duration-300 group relative cursor-pointer"
          >
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#33394c] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {bar.amount}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-[10px] font-bold text-[#8c909f] uppercase tracking-widest px-2 border-t border-slate-800/60 pt-4">
        <span>08:00</span>
        <span>12:00</span>
        <span>16:00</span>
        <span>20:00</span>
        <span>00:00</span>
      </div>
    </div>
  )
}
