import { Briefcase, CheckCircle2 } from "lucide-react"
import type { UserProfile } from "../types"

interface BusinessDetailsCardProps {
  profile: UserProfile
}

export default function BusinessDetailsCard({ profile }: BusinessDetailsCardProps) {
  return (
    <div className="bg-[#0F172A] border border-slate-700/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#ADC6FF]/10 flex items-center justify-center text-[#ADC6FF]">
            <Briefcase className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-[#F8FAFC]">Business Information</h2>
        </div>

        {/* Verified Provider Badge */}
        {profile.role === "owner" && (
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00A74B]/10 text-[#4AE176] border border-[#4AE176]/20 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {profile.isVerified ? "Verified Provider" : "Pending Verification"}
          </span>
        )}
      </div>

      {/* Business Name Highlight Box */}
      <div className="bg-[#020617] border border-slate-800/50 p-6 rounded-xl space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
          BUSINESS NAME
        </span>
        <p className="text-2xl sm:text-3xl font-black text-[#ADC6FF] tracking-tight">
          {profile.businessName || "No business registered"}
        </p>
      </div>

      {/* Grid of Business Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
            BUSINESS EMAIL
          </span>
          <p className="text-lg font-normal text-[#F8FAFC] truncate">
            {profile.businessEmail || profile.email || "N/A"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
            WHATSAPP
          </span>
          <p className="text-lg font-normal text-[#F8FAFC]">
            {profile.whatsapp || profile.phone || "N/A"}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
          HEADQUARTERS
        </span>
        <p className="text-lg font-normal text-[#F8FAFC]">
          {profile.headquarters || profile.address || "N/A"}
        </p>
      </div>
    </div>
  )
}
