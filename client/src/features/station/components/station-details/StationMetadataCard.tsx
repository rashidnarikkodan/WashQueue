import { Info, MapPin } from "lucide-react"
import type { Station } from "../../types"

interface StationMetadataCardProps {
  station: Station
  ownerName?: string
}

export default function StationMetadataCard({
  station,
  ownerName = "David Steinberg",
}: StationMetadataCardProps) {
  const fullAddress = [
    station.address?.street,
    station.address?.city,
    station.address?.state,
    station.address?.pincode,
    station.address?.country,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="bg-[#191f31] p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Info size={18} className="text-[#adc6ff]" />
        <span>Operational Metadata</span>
      </h3>

      <div className="space-y-4 divide-y divide-slate-800/80 text-sm">
        <div className="flex justify-between items-center py-2">
          <span className="text-[#8c909f]">Primary Owner</span>
          <span className="font-semibold text-white">{ownerName}</span>
        </div>

        <div className="flex justify-between items-center pt-3 py-2">
          <span className="text-[#8c909f]">Facility Type</span>
          <span className="font-semibold text-white">Full Service Hub</span>
        </div>

        <div className="flex justify-between items-center pt-3 py-2">
          <span className="text-[#8c909f]">Bays / Capacity</span>
          <span className="font-semibold text-white">{station.slotConfig?.bays || 1} Bays</span>
        </div>

        <div className="flex justify-between items-center pt-3 py-2">
          <span className="text-[#8c909f]">Last Inspection</span>
          <span className="font-semibold text-white">Oct 12, 2023</span>
        </div>

        <div className="pt-5 border-t border-slate-800/80 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8c909f] block">
            Location Overview
          </span>

          <div className="aspect-video rounded-xl bg-[#151b2d] overflow-hidden relative group border border-white/5 flex items-center justify-center bg-[radial-[#2e3447]_1px,transparent_1px] [background-size:16px_16px]">
            <div className="p-3 bg-[#0c1324]/80 backdrop-blur-md rounded-full text-[#adc6ff] border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
              <MapPin size={28} className="fill-[#adc6ff]" />
            </div>
          </div>

          <p className="text-xs text-[#c2c6d6] leading-relaxed pt-1">
            {fullAddress || "1200 Bayside Drive, Suite 400, San Francisco, CA 94105"}
          </p>

          {(station.location?.latitude || station.location?.longitude) && (
            <div className="text-[11px] font-mono text-[#8c909f] pt-1">
              Lat: {station.location.latitude} • Lng: {station.location.longitude}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
