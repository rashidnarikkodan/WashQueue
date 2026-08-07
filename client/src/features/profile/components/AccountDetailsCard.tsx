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
        badgeColor: "bg-[#00A74B]/10 text-[#4AE176] border-[#4AE176]/20",
        description: "Authenticated via Mobile Phone SMS Verification Code",
        icon: <Smartphone className="w-5 h-5 text-[#4AE176] shrink-0" />,
      }
    }

    // Default: local / password / email
    return {
      label: "Email & Password Auth",
      badge: "Password Protected",
      badgeColor: "bg-[#ADC6FF]/10 text-[#ADC6FF] border-[#ADC6FF]/20",
      description: "Encrypted password credentials with session JWT tokens",
      icon: <Lock className="w-5 h-5 text-[#ADC6FF] shrink-0" />,
    }
  }

  const authDetails = getAuthProviderDetails(profile.authProvider)

  return (
    <div className="bg-[#0F172A] border border-slate-700/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#ADC6FF]/10 flex items-center justify-center text-[#ADC6FF]">
          <Settings className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-[#F8FAFC]">Account Information</h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Current Status Card */}
        <div className="bg-[#020617] border border-slate-800/60 p-5 rounded-xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
            CURRENT STATUS
          </span>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00A74B]/10 border border-[#4AE176]/20 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#4AE176] animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#4AE176]">
              {profile.isVerified ? "ACCOUNT ACTIVE" : "PENDING VERIFICATION"}
            </span>
          </div>
        </div>

        {/* Dynamic Authentication Provider Card */}
        <div className="bg-[#020617] border border-slate-800/60 p-5 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              AUTHENTICATION METHOD
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${authDetails.badgeColor}`}
            >
              {authDetails.badge}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40">
              {authDetails.icon}
            </div>
            <div>
              <p className="text-base font-bold text-[#F8FAFC] leading-tight">
                {authDetails.label}
              </p>
              <p className="text-xs text-[#94A3B8] mt-0.5">{authDetails.description}</p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="bg-[#020617] border border-slate-800/60 p-5 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">LAST UPDATED</span>
          </div>
          <p className="text-lg font-semibold text-[#F8FAFC]">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Member Since */}
        <div className="bg-[#020617] border border-slate-800/60 p-5 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">MEMBER SINCE</span>
          </div>
          <p className="text-lg font-semibold text-[#F8FAFC]">{formattedMemberSince}</p>
        </div>
      </div>
    </div>
  )
}
