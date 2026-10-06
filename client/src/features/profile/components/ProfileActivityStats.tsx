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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative text-card-foreground">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
            ACTIVE STATIONS
          </span>
          <div className="flex items-end justify-between">
            <span className="text-4xl sm:text-5xl font-black text-foreground">
              {stats.activeStations ?? 3}
            </span>
            <Fuel className="w-8 h-8 text-amber-500 opacity-60 mb-1" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative text-card-foreground">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
            TOTAL REVENUE PROCESSED
          </span>
          <div className="flex items-end justify-between">
            <span className="text-3xl sm:text-4xl font-black text-emerald-500">
              {stats.totalRevenueProcessed ?? "$24,850"}
            </span>
            <DollarSign className="w-8 h-8 text-emerald-500 opacity-60 mb-1" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative text-card-foreground">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
            STAFF & MANAGERS
          </span>
          <div className="flex items-end justify-between">
            <span className="text-4xl sm:text-5xl font-black text-foreground">
              {stats.activeStaff ?? 8}
            </span>
            <Users className="w-8 h-8 text-primary opacity-60 mb-1" />
          </div>
        </div>
      </div>
    )
  }

  if (role === "manager") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative text-card-foreground">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
            QUEUES HANDLED TODAY
          </span>
          <div className="flex items-end justify-between">
            <span className="text-4xl sm:text-5xl font-black text-blue-500">
              {stats.todayQueuesHandled ?? 28}
            </span>
            <Clock className="w-8 h-8 text-blue-500 opacity-60 mb-1" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative text-card-foreground">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
            INSPECTIONS COMPLETED
          </span>
          <div className="flex items-end justify-between">
            <span className="text-4xl sm:text-5xl font-black text-emerald-500">
              {stats.inspectionsCompleted ?? 42}
            </span>
            <CheckCircle className="w-8 h-8 text-emerald-500 opacity-60 mb-1" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative text-card-foreground">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
            TOTAL BOOKINGS PROCESSED
          </span>
          <div className="flex items-end justify-between">
            <span className="text-4xl sm:text-5xl font-black text-foreground">
              {stats.totalBookings ?? 154}
            </span>
            <CalendarCheck className="w-8 h-8 text-primary opacity-60 mb-1" />
          </div>
        </div>
      </div>
    )
  }

  if (role === "admin") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative text-card-foreground">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
            REGISTERED SYSTEM USERS
          </span>
          <div className="flex items-end justify-between">
            <span className="text-4xl sm:text-5xl font-black text-purple-500">
              {(stats.systemUsersCount ?? 1240).toLocaleString()}
            </span>
            <Users className="w-8 h-8 text-purple-500 opacity-60 mb-1" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative text-card-foreground">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
            ACTIVE PLATFORM STATIONS
          </span>
          <div className="flex items-end justify-between">
            <span className="text-4xl sm:text-5xl font-black text-foreground">
              {stats.platformStationsCount ?? 48}
            </span>
            <Fuel className="w-8 h-8 text-primary opacity-60 mb-1" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative text-card-foreground">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-4">
            OPEN TICKETS & ISSUES
          </span>
          <div className="flex items-end justify-between">
            <span className="text-4xl sm:text-5xl font-black text-rose-500">
              {stats.openTicketsCount ?? 3}
            </span>
            <ShieldAlert className="w-8 h-8 text-rose-500 opacity-60 mb-1" />
          </div>
        </div>
      </div>
    )
  }

  // Customer default
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
