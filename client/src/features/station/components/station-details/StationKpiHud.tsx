import { Calendar, Hourglass, CreditCard, Gauge, Timer, TrendingUp, TrendingDown } from "lucide-react"
import type { Station } from "../../types"

interface StationKpiHudProps {
  station: Station
}

export default function StationKpiHud({ station }: StationKpiHudProps) {
  const baysCount = station.slotConfig?.bays || 2

  return (
    <section className="overflow-x-auto hide-scrollbar py-2">
      <div className="flex gap-5 min-w-max">
        {/* Card 1: Today's Bookings */}
        <div className="w-72 bg-[#151b2d] p-6 rounded-2xl hover:bg-[#191f31] border border-white/5 transition-all space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-[#adc6ff]/10 text-[#adc6ff] rounded-xl">
              <Calendar size={20} />
            </div>
            <span className="text-[#4ae176] text-xs font-bold flex items-center gap-1">
              +12% <TrendingUp size={14} />
            </span>
          </div>
          <div>
            <div className="text-[#8c909f] text-[11px] font-bold uppercase tracking-widest">
              Today's Bookings
            </div>
            <div className="text-3xl font-extrabold text-[#dce1fb] mt-1">142</div>
          </div>
        </div>

        {/* Card 2: Active Queue */}
        <div className="w-72 bg-[#151b2d] p-6 rounded-2xl hover:bg-[#191f31] border border-white/5 transition-all space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-[#4ae176]/10 text-[#4ae176] rounded-xl">
              <Hourglass size={20} />
            </div>
            <span className="px-2 py-0.5 bg-[#4ae176]/15 text-[#4ae176] text-[10px] font-bold uppercase tracking-wider rounded">
              Active
            </span>
          </div>
          <div>
            <div className="text-[#8c909f] text-[11px] font-bold uppercase tracking-widest">
              Active Queue
            </div>
            <div className="text-3xl font-extrabold text-[#dce1fb] mt-1">8 Cars</div>
          </div>
        </div>

        {/* Card 3: Revenue Today */}
        <div className="w-72 bg-[#151b2d] p-6 rounded-2xl hover:bg-[#191f31] border border-white/5 transition-all space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-[#3e495d] text-[#aeb9d0] rounded-xl">
              <CreditCard size={20} />
            </div>
            <span className="text-[#4ae176] text-xs font-bold flex items-center gap-1">
              +$420 <TrendingUp size={14} />
            </span>
          </div>
          <div>
            <div className="text-[#8c909f] text-[11px] font-bold uppercase tracking-widest">
              Revenue Today
            </div>
            <div className="text-3xl font-extrabold text-[#dce1fb] mt-1">$3,842.00</div>
          </div>
        </div>

        {/* Card 4: Occupancy */}
        <div className="w-72 bg-[#151b2d] p-6 rounded-2xl hover:bg-[#191f31] border border-white/5 transition-all space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-[#adc6ff]/10 text-[#adc6ff] rounded-xl">
              <Gauge size={20} />
            </div>
            <span className="text-red-400 text-xs font-bold flex items-center gap-1">
              -2% <TrendingDown size={14} />
            </span>
          </div>
          <div>
            <div className="text-[#8c909f] text-[11px] font-bold uppercase tracking-widest">
              Occupancy ({baysCount} Bays)
            </div>
            <div className="text-3xl font-extrabold text-[#dce1fb] mt-1">88.4%</div>
          </div>
        </div>

        {/* Card 5: Avg Wait Time */}
        <div className="w-72 bg-[#151b2d] p-6 rounded-2xl hover:bg-[#191f31] border border-white/5 transition-all space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-[#4ae176]/10 text-[#4ae176] rounded-xl">
              <Timer size={20} />
            </div>
            <span className="text-[#8c909f] text-[10px] font-bold uppercase tracking-widest">
              Target 12m
            </span>
          </div>
          <div>
            <div className="text-[#8c909f] text-[11px] font-bold uppercase tracking-widest">
              Avg Wait Time
            </div>
            <div className="text-3xl font-extrabold text-[#dce1fb] mt-1">14 min</div>
          </div>
        </div>
      </div>
    </section>
  )
}
