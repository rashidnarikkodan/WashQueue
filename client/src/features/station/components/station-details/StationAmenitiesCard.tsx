import { Wifi, Coffee, Zap, Heart, CheckCircle2 } from "lucide-react"

interface StationAmenitiesCardProps {
  amenities?: string[]
}

export default function StationAmenitiesCard({ amenities = [] }: StationAmenitiesCardProps) {
  const defaultAmenities = [
    { label: "WiFi Lounge", icon: <Wifi size={14} /> },
    { label: "Premium Cafe", icon: <Coffee size={14} /> },
    { label: "EV Charging", icon: <Zap size={14} /> },
    { label: "Pet Friendly", icon: <Heart size={14} /> },
  ]

  const itemsToDisplay =
    amenities.length > 0
      ? amenities.map((a) => ({ label: a, icon: <CheckCircle2 size={14} /> }))
      : defaultAmenities

  return (
    <div className="bg-[#191f31] p-6 sm:p-8 rounded-2xl border border-white/5 space-y-4">
      <h3 className="text-lg font-bold text-white">Amenities</h3>
      <div className="flex flex-wrap gap-2.5">
        {itemsToDisplay.map((item, idx) => (
          <span
            key={idx}
            className="px-3.5 py-2 bg-[#2e3447] text-white text-xs font-semibold rounded-xl flex items-center gap-2 border border-white/5 hover:border-[#adc6ff]/30 transition-colors"
          >
            <span className="text-[#adc6ff]">{item.icon}</span>
            <span>{item.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
