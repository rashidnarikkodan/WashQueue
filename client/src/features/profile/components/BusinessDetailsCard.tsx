import { Briefcase, CheckCircle2, Building, Landmark, MessageSquare } from "lucide-react"
import type { UserProfile } from "../types"

interface BusinessDetailsCardProps {
  profile: UserProfile
}

export default function BusinessDetailsCard({ profile }: BusinessDetailsCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-xs sm:shadow-xl text-card-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-foreground">
            Business & Payout Information
          </h2>
        </div>

        <span className="flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 w-fit">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {profile.isVerified ? "Verified Partner" : "Pending Verification"}
        </span>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 p-4 sm:p-6 rounded-lg sm:rounded-xl space-y-0.5 sm:space-y-1">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-500 block">
          REGISTERED BUSINESS BRAND
        </span>
        <p className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
          {profile.businessName || "WashQueue Partner Operations"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            TAX / REGISTRATION ID
          </span>
          <p className="text-sm sm:text-base font-semibold text-foreground">
            {profile.taxId || "US-TAX-8849201"}
          </p>
        </div>

        <div className="space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            BUSINESS EMAIL
          </span>
          <p className="text-sm sm:text-base font-semibold text-foreground truncate">
            {profile.businessEmail || profile.email || "N/A"}
          </p>
        </div>

        <div className="space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            WHATSAPP SUPPORT HOTLINE
          </span>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <p className="text-sm sm:text-base font-semibold text-foreground">
              {profile.whatsapp || profile.phone || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 pt-2 border-t border-border/60">
        <div className="space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            HEADQUARTERS LOCATION
          </span>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm sm:text-base font-semibold text-foreground">
              {profile.headquarters || "100 Grand Avenue, Suite 400, NY"}
            </p>
          </div>
        </div>

        <div className="space-y-0.5 sm:space-y-1">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            SETTLEMENT PAYOUT ACCOUNT
          </span>
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-primary" />
            <p className="text-sm sm:text-base font-semibold text-foreground">
              {profile.payoutAccount || "Chase Bank •••• 4829 (Verified)"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
