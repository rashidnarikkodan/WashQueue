import { Settings, ShieldCheck } from "lucide-react"
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
        
        {/* Current Status */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
            CURRENT STATUS
          </span>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00A74B]/10 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#4AE176] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4AE176]">
              ACCOUNT ACTIVE
            </span>
          </div>
        </div>

        {/* Authentication */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
            AUTHENTICATION
          </span>
          <div className="flex items-center gap-2 text-base font-medium text-[#F8FAFC]">
            <ShieldCheck className="w-5 h-5 text-[#ADC6FF]" />
            <span>
              {profile.authProvider === "google"
                ? "Google Managed Account"
                : "Password Protected"}
            </span>
          </div>
        </div>

        {/* Last Updated */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
            LAST UPDATED
          </span>
          <p className="text-lg font-normal text-[#F8FAFC]">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Member Since */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
            MEMBER SINCE
          </span>
          <p className="text-lg font-normal text-[#F8FAFC]">
            {formattedMemberSince}
          </p>
        </div>
      </div>
    </div>
  )
}
