import { Briefcase, CheckCircle2 } from "lucide-react"
import type { UserProfile } from "../types"

interface BusinessDetailsCardProps {
  profile: UserProfile
}

export default function BusinessDetailsCard({ profile }: BusinessDetailsCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl text-card-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Business Information</h2>
        </div>

        {profile.role === "owner" && (
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {profile.isVerified ? "Verified Provider" : "Pending Verification"}
          </span>
        )}
      </div>

      <div className="bg-muted/50 border border-border/80 p-6 rounded-xl space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          BUSINESS NAME
        </span>
        <p className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
          {profile.businessName || "No business registered"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            BUSINESS EMAIL
          </span>
          <p className="text-lg font-normal text-foreground truncate">
            {profile.businessEmail || profile.email || "N/A"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            WHATSAPP
          </span>
          <p className="text-lg font-normal text-foreground">
            {profile.whatsapp || profile.phone || "N/A"}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          HEADQUARTERS
        </span>
        <p className="text-lg font-normal text-foreground">
          {profile.headquarters || "N/A"}
        </p>
      </div>
    </div>
  )
}
