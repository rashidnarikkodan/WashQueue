import { Settings, Lock, Smartphone, Calendar, Clock } from "lucide-react"
import type { UserProfile } from "../types"

interface AccountDetailsCardProps {
  profile: UserProfile
}

export default function AccountDetailsCard({ profile }: AccountDetailsCardProps) {
  const formattedMemberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "Jan 04, 2026"

  const getAuthProviderDetails = (provider?: string) => {
    const p = (provider || "local").toLowerCase()

    if (p === "google") {
      return {
        label: "Google Managed Account",
        badge: "Google SSO",
        badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        description: "Authenticated via Google OAuth 2.0 Single Sign-On",
        icon: (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        ),
      }
    }

    if (p === "phone" || p === "otp") {
      return {
        label: "Phone & OTP Verified",
        badge: "SMS OTP",
        badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        description: "Authenticated via Mobile Phone SMS Verification Code",
        icon: <Smartphone className="w-5 h-5 text-emerald-500 shrink-0" />,
      }
    }

    return {
      label: "Email & Password Auth",
      badge: "Password Protected",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
      description: "Encrypted password credentials with session JWT tokens",
      icon: <Lock className="w-5 h-5 text-primary shrink-0" />,
    }
  }

  const authDetails = getAuthProviderDetails(profile.authProvider)

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl text-card-foreground">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Settings className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Account Information</h2>
      </div>

      <div className="w-full">
        <div className="w-full bg-muted/50 border border-border/80 p-5 rounded-xl space-y-3">
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              AUTHENTICATION METHOD
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${authDetails.badgeColor}`}
            >
              {authDetails.badge}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
            <div className="p-2 rounded-lg bg-background border border-border w-fit shrink-0">
              {authDetails.icon}
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-foreground leading-tight">
                {authDetails.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 break-words">
                {authDetails.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-muted/50 border border-border/80 p-5 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">LAST UPDATED</span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="bg-muted/50 border border-border/80 p-5 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">MEMBER SINCE</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{formattedMemberSince}</p>
        </div>
      </div>
    </div>
  )
}
