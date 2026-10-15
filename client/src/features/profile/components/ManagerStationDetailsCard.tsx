import { Wrench, MapPin, Clock, BadgeCheck } from "lucide-react"
import type { UserProfile } from "../types"

interface ManagerStationDetailsCardProps {
  profile: UserProfile
}

export default function ManagerStationDetailsCard({ profile }: ManagerStationDetailsCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-xs sm:shadow-xl text-card-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-foreground">
            Station & Shift Information
          </h2>
        </div>

        <span className="flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20 w-fit">
          <BadgeCheck className="w-3.5 h-3.5" />
          Manager ID: {profile.managerBadgeId || "MGR-8821"}
        </span>
      </div>

      <div className="bg-muted/50 border border-border/80 p-4 sm:p-6 rounded-lg sm:rounded-xl space-y-0.5 sm:space-y-1">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          ASSIGNED WASH STATION
        </span>
        <div className="flex items-center gap-2 pt-0.5 sm:pt-1">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
          <p className="text-xl sm:text-3xl font-black text-primary tracking-tight">
            {profile.assignedStationName || "Metro Central Wash Station"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <div className="space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            SHIFT SCHEDULE
          </span>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm sm:text-base font-semibold text-foreground">
              {profile.shiftSchedule || "Morning Shift (08:00 AM - 04:00 PM)"}
            </p>
          </div>
        </div>

        <div className="space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            EMERGENCY CONTACT
          </span>
          <p className="text-sm sm:text-base font-semibold text-foreground">
            {profile.emergencyContact || "+1 (555) 998-1122"}
          </p>
        </div>
      </div>
    </div>
  )
}
