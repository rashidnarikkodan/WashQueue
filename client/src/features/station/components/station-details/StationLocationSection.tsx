import { MapPin, Navigation } from "lucide-react"
import LocationPickerMap from "@/shared/components/map/LocationPickerMap"

interface StationLocationSectionProps {
  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
  }
  location?: {
    latitude?: number
    longitude?: number
  }
  stationName?: string
}

export function StationLocationSection({
  address,
  location,
  stationName,
}: StationLocationSectionProps) {
  const fullAddress = address?.street ? `${address.street}, ${address.city}` : "Station Address"

  const cityState = address?.city
    ? `${address.city}, ${address.state || ""} ${address.pincode || ""}`
    : ""

  const lat = location?.latitude || 0
  const lng = location?.longitude || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <MapPin size={22} className="text-blue-400" />
          <span>Station Location</span>
        </h2>
      </div>

      {/* Map Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl space-y-0">
        {/* Interactive Maplibre View */}
        <LocationPickerMap
          latitude={lat}
          longitude={lng}
          readOnly={true}
          stationName={stationName}
          height="h-80 sm:h-96"
        />

        {/* Address Bar Footer */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center text-blue-400 shrink-0">
              <Navigation size={20} />
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-bold text-slate-100">{fullAddress}</h4>
              <p className="text-xs sm:text-sm font-semibold text-slate-400">{cityState}</p>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 w-fit shadow-lg shadow-blue-600/20"
          >
            <Navigation size={14} />
            Get Directions
          </a>
        </div>
      </div>
    </div>
  )
}
