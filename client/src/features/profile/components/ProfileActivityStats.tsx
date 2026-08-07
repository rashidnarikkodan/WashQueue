import { CalendarCheck, MapPin, Car } from "lucide-react"
import type { ProfileStats } from "../types"

interface ProfileActivityStatsProps {
  stats: ProfileStats
}

export default function ProfileActivityStats({ stats }: ProfileActivityStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Stat 1: Total Bookings */}
      <div className="bg-[#0F172A] border border-slate-700/20 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
        <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-4">
          TOTAL BOOKINGS
        </span>
        <div className="flex items-end justify-between">
          <span className="text-4xl sm:text-5xl font-black text-[#F8FAFC]">
            {stats.totalBookings.toLocaleString()}
          </span>
          <CalendarCheck className="w-8 h-8 text-[#ADC6FF] opacity-50 mb-1" />
        </div>
      </div>

      {/* Stat 2: Favorite Stations */}
      <div className="bg-[#0F172A] border border-slate-700/20 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
        <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-4">
          FAVORITE STATIONS
        </span>
        <div className="flex items-end justify-between">
          <span className="text-4xl sm:text-5xl font-black text-[#F8FAFC]">
            {stats.favoriteStations < 10 ? `0${stats.favoriteStations}` : stats.favoriteStations}
          </span>
          <MapPin className="w-8 h-8 text-[#ADC6FF] opacity-50 mb-1" />
        </div>
      </div>

      {/* Stat 3: Vehicles Added */}
      <div className="bg-[#0F172A] border border-slate-700/20 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
        <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-4">
          VEHICLES ADDED
        </span>
        <div className="flex items-end justify-between">
          <span className="text-4xl sm:text-5xl font-black text-[#F8FAFC]">
            {stats.vehiclesAdded < 10 ? `0${stats.vehiclesAdded}` : stats.vehiclesAdded}
          </span>
          <Car className="w-8 h-8 text-[#ADC6FF] opacity-50 mb-1" />
        </div>
      </div>
    </div>
  )
}
