import { User as UserIcon } from "lucide-react"
import type { UserProfile } from "../types"

interface PersonalDetailsCardProps {
  profile: UserProfile
}

export default function PersonalDetailsCard({ profile }: PersonalDetailsCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl h-full flex flex-col justify-between text-card-foreground">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <UserIcon className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Personal Details</h2>
      </div>

      <div className="space-y-8 flex-grow flex flex-col justify-around">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              FULL NAME
            </span>
            <p className="text-lg font-medium text-foreground">{profile.name || "N/A"}</p>
          </div>

          <div className="space-y-1 overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              EMAIL
            </span>
            <p className="text-lg font-medium text-foreground truncate">{profile.email || "N/A"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              PHONE
            </span>
            <p className="text-lg font-medium text-foreground">{profile.phone || "N/A"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              ACCOUNT STATUS
            </span>
            <p className="text-lg font-medium text-foreground capitalize">
              {profile.isVerified ? "Verified Account" : "Unverified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
