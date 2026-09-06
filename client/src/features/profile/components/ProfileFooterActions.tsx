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
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl text-card-foreground">
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={onChangePasswordClick}
          className="px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          <KeyRound className="w-4 h-4" />
          <span>Change Password</span>
        </button>
      </div>

      <div>
        <button
          onClick={onSignOutClick}
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent hover:bg-red-500/10 border border-red-500/30 text-red-500 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
