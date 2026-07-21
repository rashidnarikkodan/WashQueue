import { BarChart3, Download, Trash2 } from "lucide-react"

interface StationBottomUtilitiesProps {
  onUnlist?: () => void
}

export default function StationBottomUtilities({ onUnlist }: StationBottomUtilitiesProps) {
  return (
    <section className="pt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Analytics Card */}
        <div className="p-8 bg-[#151b2d] hover:bg-[#191f31] rounded-2xl border border-white/5 transition-all group cursor-pointer space-y-4">
          <div className="p-3 bg-[#adc6ff]/10 text-[#adc6ff] rounded-xl w-fit group-hover:scale-110 transition-transform">
            <BarChart3 size={28} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-1">Detailed Analytics</h4>
            <p className="text-sm text-[#8c909f] leading-relaxed">
              Deep dive into traffic patterns, ROI, and customer lifetime value.
            </p>
          </div>
        </div>

        {/* Export Data Card */}
        <div className="p-8 bg-[#151b2d] hover:bg-[#191f31] rounded-2xl border border-white/5 transition-all group cursor-pointer space-y-4">
          <div className="p-3 bg-[#adc6ff]/10 text-[#adc6ff] rounded-xl w-fit group-hover:scale-110 transition-transform">
            <Download size={28} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-1">Export Data</h4>
            <p className="text-sm text-[#8c909f] leading-relaxed">
              Download comprehensive CSV/PDF reports for tax or management review.
            </p>
          </div>
        </div>

        {/* Unlist Station Card */}
        <div
          onClick={onUnlist}
          className="p-8 bg-red-500/5 hover:bg-red-500/10 rounded-2xl border border-red-500/20 transition-all group cursor-pointer space-y-4"
        >
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
            <Trash2 size={28} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-red-400 mb-1">Unlist Station</h4>
            <p className="text-sm text-[#8c909f] leading-relaxed">
              Remove this station from public discovery and pause all bookings.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
