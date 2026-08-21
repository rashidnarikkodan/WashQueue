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
        <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <MapPin size={22} className="text-primary" />
          <span>Station Location</span>
        </h2>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl space-y-0">
        <LocationPickerMap
          latitude={lat}
          longitude={lng}
          readOnly={true}
          stationName={stationName}
          height="h-80 sm:h-96"
        />

        <div className="p-6 bg-card border-t border-border flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl border border-border bg-background flex items-center justify-center text-primary shrink-0">
              <Navigation size={20} />
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-bold text-foreground">{fullAddress}</h4>
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground">{cityState}</p>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 w-fit shadow-lg shadow-primary/20"
          >
            <Navigation size={14} />
            Get Directions
          </a>
        </div>
      </div>
    </div>
  )
}
