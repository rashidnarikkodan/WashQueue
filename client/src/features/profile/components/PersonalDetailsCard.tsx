import { User as UserIcon, PhoneCall, Info } from "lucide-react"
import type { UserProfile } from "../types"

interface PersonalDetailsCardProps {
  profile: UserProfile
}

export default function PersonalDetailsCard({ profile }: PersonalDetailsCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-xs sm:shadow-xl h-full flex flex-col justify-between text-card-foreground">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <h2 className="text-lg sm:text-2xl font-bold text-foreground">Personal Details</h2>
      </div>

      <div className="space-y-3.5 sm:space-y-6 flex-grow flex flex-col justify-around">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              FULL NAME
            </span>
            <p className="text-sm sm:text-lg font-semibold text-foreground">
              {profile.name || "N/A"}
            </p>
          </div>

          <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              EMAIL
            </span>
            <p className="text-sm sm:text-lg font-semibold text-foreground truncate">
              {profile.email || "N/A"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              PRIMARY PHONE
            </span>
            <p className="text-sm sm:text-lg font-semibold text-foreground">
              {profile.phone || "N/A"}
            </p>
          </div>

          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              EMERGENCY CONTACT
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <p className="text-sm sm:text-base font-semibold text-foreground">
                {profile.emergencyContact || "Not configured"}
              </p>
            </div>
          </div>
        </div>

        {profile.bio && (
          <div className="space-y-1 bg-muted/40 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border/60">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Info className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                ABOUT / BIO
              </span>
            </div>
            <p className="text-xs sm:text-sm font-normal text-foreground leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
