import {
  CalendarCheck,
  MapPin,
  Car,
  Fuel,
  DollarSign,
  Users,
  ShieldAlert,
  CheckCircle,
  Clock,
} from "lucide-react"
import type { ProfileStats, UserProfile } from "../types"

interface ProfileActivityStatsProps {
  stats: ProfileStats
  role?: UserProfile["role"]
}

export default function ProfileActivityStats({
  stats,
  role = "customer",
}: ProfileActivityStatsProps) {
  if (role === "owner") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-6">
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-8 flex flex-col justify-between shadow-xs sm:shadow-xl relative text-card-foreground">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 sm:mb-4 truncate">
            ACTIVE STATIONS
          </span>
          <div className="flex items-end justify-between">
            <span className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground">
              {stats.activeStations ?? 3}
            </span>
            <Fuel className="w-5 h-5 sm:w-8 sm:h-8 text-amber-500 opacity-60 mb-0.5 sm:mb-1 shrink-0" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-8 flex flex-col justify-between shadow-xs sm:shadow-xl relative text-card-foreground">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 sm:mb-4 truncate">
            TOTAL REVENUE
          </span>
          <div className="flex items-end justify-between">
            <span className="text-xl sm:text-3xl md:text-4xl font-black text-emerald-500 truncate">
              {stats.totalRevenueProcessed ?? "$24,850"}
            </span>
            <DollarSign className="w-5 h-5 sm:w-8 sm:h-8 text-emerald-500 opacity-60 mb-0.5 sm:mb-1 shrink-0" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-8 flex flex-col justify-between shadow-xs sm:shadow-xl relative text-card-foreground col-span-2 sm:col-span-1">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 sm:mb-4 truncate">
            STAFF & MANAGERS
          </span>
          <div className="flex items-end justify-between">
            <span className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground">
              {stats.activeStaff ?? 8}
            </span>
            <Users className="w-5 h-5 sm:w-8 sm:h-8 text-primary opacity-60 mb-0.5 sm:mb-1 shrink-0" />
          </div>
        </div>
      </div>
    )
  }

  if (role === "manager") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-6">
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-8 flex flex-col justify-between shadow-xs sm:shadow-xl relative text-card-foreground">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 sm:mb-4 truncate">
            QUEUES TODAY
          </span>
          <div className="flex items-end justify-between">
            <span className="text-2xl sm:text-4xl md:text-5xl font-black text-blue-500">
              {stats.todayQueuesHandled ?? 28}
            </span>
            <Clock className="w-5 h-5 sm:w-8 sm:h-8 text-blue-500 opacity-60 mb-0.5 sm:mb-1 shrink-0" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-8 flex flex-col justify-between shadow-xs sm:shadow-xl relative text-card-foreground">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 sm:mb-4 truncate">
            INSPECTIONS
          </span>
          <div className="flex items-end justify-between">
            <span className="text-2xl sm:text-4xl md:text-5xl font-black text-emerald-500">
              {stats.inspectionsCompleted ?? 42}
            </span>
            <CheckCircle className="w-5 h-5 sm:w-8 sm:h-8 text-emerald-500 opacity-60 mb-0.5 sm:mb-1 shrink-0" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-8 flex flex-col justify-between shadow-xs sm:shadow-xl relative text-card-foreground col-span-2 sm:col-span-1">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 sm:mb-4 truncate">
            TOTAL BOOKINGS PROCESSED
          </span>
          <div className="flex items-end justify-between">
            <span className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground">
              {stats.totalBookings ?? 154}
            </span>
            <CalendarCheck className="w-5 h-5 sm:w-8 sm:h-8 text-primary opacity-60 mb-0.5 sm:mb-1 shrink-0" />
          </div>
        </div>
      </div>
    )
  }

  if (role === "admin") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-6">
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-8 flex flex-col justify-between shadow-xs sm:shadow-xl relative text-card-foreground">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 sm:mb-4 truncate">
            SYSTEM USERS
          </span>
          <div className="flex items-end justify-between">
            <span className="text-2xl sm:text-4xl md:text-5xl font-black text-purple-500">
              {(stats.systemUsersCount ?? 1240).toLocaleString()}
            </span>
            <Users className="w-5 h-5 sm:w-8 sm:h-8 text-purple-500 opacity-60 mb-0.5 sm:mb-1 shrink-0" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-8 flex flex-col justify-between shadow-xs sm:shadow-xl relative text-card-foreground">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 sm:mb-4 truncate">
            ACTIVE STATIONS
          </span>
          <div className="flex items-end justify-between">
            <span className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground">
              {stats.platformStationsCount ?? 48}
            </span>
            <Fuel className="w-5 h-5 sm:w-8 sm:h-8 text-primary opacity-60 mb-0.5 sm:mb-1 shrink-0" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-8 flex flex-col justify-between shadow-xs sm:shadow-xl relative text-card-foreground col-span-2 sm:col-span-1">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 sm:mb-4 truncate">
            OPEN TICKETS & ISSUES
          </span>
          <div className="flex items-end justify-between">
            <span className="text-2xl sm:text-4xl md:text-5xl font-black text-rose-500">
              {stats.openTicketsCount ?? 3}
            </span>
            <ShieldAlert className="w-5 h-5 sm:w-8 sm:h-8 text-rose-500 opacity-60 mb-0.5 sm:mb-1 shrink-0" />
          </div>
        </div>
      </div>
    )
  }

  // Customer default
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-6">
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-8 flex flex-col justify-between shadow-xs sm:shadow-xl relative text-card-foreground">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 sm:mb-4 truncate">
          TOTAL BOOKINGS
        </span>
        <div className="flex items-end justify-between">
          <span className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground">
            {stats.totalBookings.toLocaleString()}
          </span>
          <CalendarCheck className="w-5 h-5 sm:w-8 sm:h-8 text-primary opacity-50 mb-0.5 sm:mb-1 shrink-0" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-8 flex flex-col justify-between shadow-xs sm:shadow-xl relative text-card-foreground">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 sm:mb-4 truncate">
          FAVORITES
        </span>
        <div className="flex items-end justify-between">
          <span className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground">
            {stats.favoriteStations < 10 ? `0${stats.favoriteStations}` : stats.favoriteStations}
          </span>
          <MapPin className="w-5 h-5 sm:w-8 sm:h-8 text-primary opacity-50 mb-0.5 sm:mb-1 shrink-0" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-8 flex flex-col justify-between shadow-xs sm:shadow-xl relative text-card-foreground col-span-2 sm:col-span-1">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 sm:mb-4 truncate">
          VEHICLES ADDED
        </span>
        <div className="flex items-end justify-between">
          <span className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground">
            {stats.vehiclesAdded < 10 ? `0${stats.vehiclesAdded}` : stats.vehiclesAdded}
          </span>
          <Car className="w-5 h-5 sm:w-8 sm:h-8 text-primary opacity-50 mb-0.5 sm:mb-1 shrink-0" />
        </div>
      </div>
    </div>
  )
}
