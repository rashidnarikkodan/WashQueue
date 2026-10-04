import { Shield, ShieldCheck, Cpu, KeyRound } from "lucide-react"
import type { UserProfile } from "../types"

interface AdminGovernanceCardProps {
  profile: UserProfile
}

export default function AdminGovernanceCard({ profile }: AdminGovernanceCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl text-card-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Admin Access & Security Governance</h2>
        </div>

        <span className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-500 border border-purple-500/20 w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          {profile.adminTier || "Super Administrator"}
        </span>
      </div>

      <div className="bg-purple-500/5 border border-purple-500/20 p-6 rounded-xl space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
          SECURITY CLEARANCE & SCOPE
        </span>
        <p className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          {profile.securityClearance || "Level 5 - Unrestricted System Operations"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            GOVERNANCE DEPARTMENT
          </span>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <p className="text-base font-semibold text-foreground">
              {profile.department || "Platform Infrastructure & Security"}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            SYSTEM PERMISSIONS
          </span>
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <p className="text-base font-semibold text-foreground">Full Administrative Rights</p>
          </div>
        </div>
      </div>
    </div>
  )
}
