import { User as UserIcon } from "lucide-react"
import type { UserProfile } from "../types"

interface PersonalDetailsCardProps {
  profile: UserProfile
}

export default function PersonalDetailsCard({ profile }: PersonalDetailsCardProps) {
  return (
    <div className="bg-[#0F172A] border border-slate-700/20 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#ADC6FF]/10 flex items-center justify-center text-[#ADC6FF]">
          <UserIcon className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-[#F8FAFC]">Personal Details</h2>
      </div>

      {/* Grid of Fields */}
      <div className="space-y-8 flex-grow flex flex-col justify-around">
        {/* Row 1: Full Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              FULL NAME
            </span>
            <p className="text-lg font-medium text-[#F8FAFC]">{profile.name || "N/A"}</p>
          </div>

          <div className="space-y-1 overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              EMAIL
            </span>
            <p className="text-lg font-medium text-[#F8FAFC] truncate">{profile.email || "N/A"}</p>
          </div>
        </div>

        {/* Row 2: Phone & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              PHONE
            </span>
            <p className="text-lg font-medium text-[#F8FAFC]">{profile.phone || "N/A"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              ADDRESS
            </span>
            <p className="text-lg font-medium text-[#F8FAFC]">{profile.address || "N/A"}</p>
          </div>
        </div>

        {/* Row 3: City & State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              CITY
            </span>
            <p className="text-lg font-medium text-[#F8FAFC]">{profile.city || "N/A"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              STATE
            </span>
            <p className="text-lg font-medium text-[#F8FAFC]">{profile.state || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
