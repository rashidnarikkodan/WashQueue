import { Plus, AlertTriangle, HelpCircle } from "lucide-react"

interface StationStickyFooterProps {
  onQuickBooking?: () => void
  onEmergencyPause?: () => void
}

export default function StationStickyFooter({
  onQuickBooking,
  onEmergencyPause,
}: StationStickyFooterProps) {
  return (
    <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-[#0c1324]/75 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 flex items-center gap-2 shadow-2xl shadow-black/80">
        <button
          type="button"
          onClick={onQuickBooking}
          className="px-5 py-2.5 bg-[#adc6ff] text-[#002e6a] font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 hover:bg-blue-300 active:scale-95 transition-all cursor-pointer shadow-md"
        >
          <Plus size={16} />
          <span>Quick Booking</span>
        </button>

        <div className="w-px h-6 bg-white/10 mx-1"></div>

        <button
          type="button"
          onClick={onEmergencyPause}
          className="px-5 py-2.5 bg-red-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 hover:bg-red-600 active:scale-95 transition-all cursor-pointer shadow-md shadow-red-500/20"
        >
          <AlertTriangle size={16} />
          <span>Emergency Pause</span>
        </button>

        <div className="w-px h-6 bg-white/10 mx-1"></div>

        <button
          type="button"
          className="p-2.5 text-[#8c909f] hover:text-[#adc6ff] transition-colors cursor-pointer"
          title="Help & Support"
        >
          <HelpCircle size={20} />
        </button>
      </div>
    </footer>
  )
}
