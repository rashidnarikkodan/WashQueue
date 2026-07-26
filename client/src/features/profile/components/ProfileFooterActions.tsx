import { LogOut, KeyRound, SlidersHorizontal } from "lucide-react"

interface ProfileFooterActionsProps {
  onUpdateSettingsClick: () => void
  onChangePasswordClick: () => void
  onSignOutClick: () => void
}

export default function ProfileFooterActions({
  onUpdateSettingsClick,
  onChangePasswordClick,
  onSignOutClick,
}: ProfileFooterActionsProps) {
  return (
    <div className="bg-[#0F172A] border border-slate-700/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
      
      {/* Left side actions */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={onUpdateSettingsClick}
          className="px-8 py-4 rounded-xl bg-[#ADC6FF] hover:bg-[#c2d7ff] text-[#002E6A] font-bold text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#002E6A]" />
          <span>Update Settings</span>
        </button>

        <button
          onClick={onChangePasswordClick}
          className="px-8 py-4 rounded-xl bg-[#1E293B] hover:bg-[#2e3e56] border border-slate-700/40 text-[#F8FAFC] font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <KeyRound className="w-4 h-4 text-[#94A3B8]" />
          <span>Change Password</span>
        </button>
      </div>

      {/* Right side: Sign Out */}
      <div>
        <button
          onClick={onSignOutClick}
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent hover:bg-red-950/40 border border-[#FFB4AB]/30 text-[#FFB4AB] font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4 text-[#FFB4AB]" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
