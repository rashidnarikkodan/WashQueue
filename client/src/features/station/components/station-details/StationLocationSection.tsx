import { MapPin, Navigation } from "lucide-react"

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
}

export function StationLocationSection({ address, location }: StationLocationSectionProps) {
  const fullAddress = address?.street
    ? `${address.street}, ${address.city}`
    : "428 Sentinel Square, Metro District"

  const cityState = address?.city
    ? `${address.city}, ${address.state} ${address.pincode || ""}`
    : "Chicago, IL 60601"

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
        Location
      </h2>

      {/* Map Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl space-y-0">
        {/* Interactive Map Visual */}
        <div className="relative h-96 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&auto=format&fit=crop&q=80"
            alt="Map Preview"
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />

          {/* Glowing Pin Marker */}
          <div className="absolute flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-blue-500/30 blur-md absolute animate-ping" />
            <div className="w-14 h-14 rounded-full bg-blue-500 shadow-2xl shadow-blue-500/50 flex items-center justify-center border-2 border-white relative z-10">
              <MapPin size={24} className="text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Address Bar Footer */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center text-blue-400 shrink-0">
              <Navigation size={22} />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-100">{fullAddress}</h4>
              <p className="text-sm font-semibold text-slate-400">
                {cityState} • <span className="text-blue-400">2.4 miles from you</span>
              </p>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${location?.latitude || 41.8781},${location?.longitude || -87.6298}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 w-fit border border-white/5"
          >
            <Navigation size={14} />
            Get Directions
          </a>
        </div>
      </div>
    </div>
  )
}
