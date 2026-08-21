import { CalendarCheck, MapPin, Car } from "lucide-react"
import type { ProfileStats } from "../types"

interface ProfileActivityStatsProps {
  stats: ProfileStats
}

export default function ProfileActivityStats({ stats }: ProfileActivityStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative text-card-foreground">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
          TOTAL BOOKINGS
        </span>
        <div className="flex items-end justify-between">
          <span className="text-4xl sm:text-5xl font-black text-foreground">
            {stats.totalBookings.toLocaleString()}
          </span>
          <CalendarCheck className="w-8 h-8 text-primary opacity-50 mb-1" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative text-card-foreground">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
          FAVORITE STATIONS
        </span>
        <div className="flex items-end justify-between">
          <span className="text-4xl sm:text-5xl font-black text-foreground">
            {stats.favoriteStations < 10 ? `0${stats.favoriteStations}` : stats.favoriteStations}
          </span>
          <MapPin className="w-8 h-8 text-primary opacity-50 mb-1" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative text-card-foreground">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
          VEHICLES ADDED
        </span>
        <div className="flex items-end justify-between">
          <span className="text-4xl sm:text-5xl font-black text-foreground">
            {stats.vehiclesAdded < 10 ? `0${stats.vehiclesAdded}` : stats.vehiclesAdded}
          </span>
          <Car className="w-8 h-8 text-primary opacity-50 mb-1" />
        </div>
      </div>
    </div>
  )
}
