import { LogOut, KeyRound } from "lucide-react"

interface ProfileFooterActionsProps {
  onChangePasswordClick: () => void
  onSignOutClick: () => void
  isLocal?: boolean
}

export default function ProfileFooterActions({
  onChangePasswordClick,
  onSignOutClick,
}: ProfileFooterActionsProps) {
  return (
    <div className="bg-[#0F172A] border border-slate-700/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
      {/* Left side actions */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={onChangePasswordClick}
          className="px-8 py-4 rounded-xl bg-[#ADC6FF] hover:bg-[#c2d7ff] text-[#002E6A] font-bold text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          <KeyRound className="w-4 h-4 text-[#002E6A]" />
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
