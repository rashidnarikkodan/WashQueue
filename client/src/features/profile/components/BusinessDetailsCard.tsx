import { Briefcase, CheckCircle2, Building, Landmark, MessageSquare } from "lucide-react"
import type { UserProfile } from "../types"

interface BusinessDetailsCardProps {
  profile: UserProfile
}

export default function BusinessDetailsCard({ profile }: BusinessDetailsCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl text-card-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Briefcase className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Business & Payout Information</h2>
        </div>

        <span className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 w-fit">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {profile.isVerified ? "Verified Service Partner" : "Pending Verification"}
        </span>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-xl space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
          REGISTERED BUSINESS BRAND
        </span>
        <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          {profile.businessName || "WashQueue Partner Operations"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            TAX / REGISTRATION ID
          </span>
          <p className="text-base font-semibold text-foreground">
            {profile.taxId || "US-TAX-8849201"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            BUSINESS EMAIL
          </span>
          <p className="text-base font-semibold text-foreground truncate">
            {profile.businessEmail || profile.email || "N/A"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            WHATSAPP SUPPORT HOTLINE
          </span>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <p className="text-base font-semibold text-foreground">
              {profile.whatsapp || profile.phone || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-border/60">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            HEADQUARTERS LOCATION
          </span>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-muted-foreground" />
            <p className="text-base font-semibold text-foreground">
              {profile.headquarters || "100 Grand Avenue, Suite 400, NY"}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            SETTLEMENT PAYOUT ACCOUNT
          </span>
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-primary" />
            <p className="text-base font-semibold text-foreground">
              {profile.payoutAccount || "Chase Bank •••• 4829 (Verified)"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
