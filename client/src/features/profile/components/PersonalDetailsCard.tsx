import { User as UserIcon, PhoneCall, Info } from "lucide-react"
import type { UserProfile } from "../types"

interface PersonalDetailsCardProps {
  profile: UserProfile
}

export default function PersonalDetailsCard({ profile }: PersonalDetailsCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl h-full flex flex-col justify-between text-card-foreground">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <UserIcon className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Personal Details</h2>
      </div>

      <div className="space-y-6 flex-grow flex flex-col justify-around">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              FULL NAME
            </span>
            <p className="text-lg font-semibold text-foreground">{profile.name || "N/A"}</p>
          </div>

          <div className="space-y-1 overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              EMAIL
            </span>
            <p className="text-lg font-semibold text-foreground truncate">
              {profile.email || "N/A"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              PRIMARY PHONE
            </span>
            <p className="text-lg font-semibold text-foreground">{profile.phone || "N/A"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              EMERGENCY CONTACT
            </span>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-muted-foreground" />
              <p className="text-base font-semibold text-foreground">
                {profile.emergencyContact || "Not configured"}
              </p>
            </div>
          </div>
        </div>

        {profile.bio && (
          <div className="space-y-1 bg-muted/40 p-4 rounded-xl border border-border/60">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Info className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">ABOUT / BIO</span>
            </div>
            <p className="text-sm font-normal text-foreground leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>
    </div>
  )
}
