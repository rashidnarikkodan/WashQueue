import { CheckCircle, User as UserIcon } from "lucide-react"
import type { User } from "../../types"

interface PersonalInformationCardProps {
  user: User
}

export default function PersonalInformationCard({ user }: PersonalInformationCardProps) {
  const fullName = (user.onboardingDetails?.fullName as string) || user.name || "N/A"
  const phone = (user.onboardingDetails?.phone as string) || user.phone || "Not Registered"

  return (
    <div className="border border-border bg-card/60 backdrop-blur-md rounded-3xl p-5 xl:p-6 shadow-xl relative">
      <div className="flex items-center gap-2 mb-6">
        <UserIcon size={18} className="text-primary" />
        <h2 className="text-base font-black uppercase text-foreground tracking-widest">
          Personal Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-sm">
        <div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
            Full Legal Name
          </p>
          <p className="font-semibold text-foreground">{fullName}</p>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
            Auth Provider ID
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {user.authProvider === "GOOGLE" ? `google-oauth2|${user.id}` : `local-hash|${user.id}`}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
            Primary Email
          </p>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">{user.email}</p>
            {user.isVerified && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle size={9} />
                <span>Verified</span>
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
            Phone Number
          </p>
          <p className="font-semibold text-foreground">{phone}</p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border/40">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
          Biography
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed italic">
          No biography registered.
        </p>
      </div>
    </div>
  )
}
