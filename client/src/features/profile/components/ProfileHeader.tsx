import { useState } from "react"
import { Mail, Phone, Calendar, Pencil, CheckCircle2 } from "lucide-react"
import type { UserProfile } from "../types"
import { getInitials } from "@/shared/utils/avatar"

interface ProfileHeaderProps {
  profile: UserProfile
  onEditClick: () => void
}

export default function ProfileHeader({ profile, onEditClick }: ProfileHeaderProps) {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(profile.name)

  const roleLabel =
    profile.role === "owner"
      ? "Verified Owner"
      : profile.role === "admin"
        ? "System Admin"
        : profile.role === "manager"
          ? "Station Manager"
          : "Verified Customer"

  const formattedMemberSince = profile.createdAt
    ? new Date(profile.createdAt).getFullYear()
    : new Date().getFullYear()

  return (
    <div className="relative bg-[#0F172A] border border-slate-700/20 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Avatar & Details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar Container */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-[#ADC6FF]/20 blur-xl opacity-50" />
            {profile.avatar && !imgError ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                onError={() => setImgError(true)}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#1E293B] object-cover shadow-2xl"
              />
            ) : (
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#1E293B] bg-gradient-to-br from-[#1E293B] to-[#002E6A] flex items-center justify-center font-black text-2xl text-[#ADC6FF] shadow-2xl">
                {initials}
              </div>
            )}
          </div>

          {/* User Name, Badges & Meta */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
                {profile.name}
              </h1>

              {/* Role Badge */}
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#ADC6FF]/10 text-[#ADC6FF] border border-[#ADC6FF]/20">
                {roleLabel}
              </span>

              {/* Verified Badge */}
              {profile.isVerified && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#00A74B]/10 text-[#4AE176] border border-[#4AE176]/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>

            {/* Email, Phone, Member Since Metadata row */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#94A3B8] font-normal pt-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#94A3B8]" />
                <span>{profile.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#94A3B8]" />
                <span>{profile.phone || "No phone added"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#94A3B8]" />
                <span>Member since: {formattedMemberSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Edit Profile CTA Button */}
        <div className="shrink-0">
          <button
            onClick={onEditClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#ADC6FF] hover:bg-[#c2d7ff] text-[#002E6A] font-extrabold text-sm transition-all shadow-lg shadow-[#ADC6FF]/20 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Pencil className="w-4 h-4 text-[#002E6A]" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
