import React from "react"
import {
  Wallet as WalletIcon,
  PlusCircle,
  FileText,
  Building2,
  CheckCircle2,
} from "lucide-react"
import type { WalletData } from "@/shared/apis/wallet.api"

interface WalletHeroCardProps {
  wallet: WalletData | null
  isLoading: boolean
  onOpenTopUp: () => void
  onOpenStatement: () => void
}

export const WalletHeroCard: React.FC<WalletHeroCardProps> = ({
  wallet,
  isLoading,
  onOpenTopUp,
  onOpenStatement,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-card p-8 border border-border shadow-2xl flex flex-col justify-between min-h-[260px]">
      {/* Background Decorative Blur */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <WalletIcon className="h-4 w-4" />
            AVAILABLE BALANCE
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Active Wallet
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            {isLoading
              ? "₹..."
              : `₹${wallet?.balance != null ? wallet.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}`}
          </span>
          <span className="text-xs text-muted-foreground font-medium">{wallet?.currency || "INR"}</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Ready for one-click wash booking reservations & extra services.
        </p>
      </div>

      <div className="pt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onOpenTopUp}
          className="px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs border border-primary/30 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          Add Funds
        </button>

        <button
          type="button"
          onClick={onOpenStatement}
          className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/70 text-foreground font-semibold text-xs border border-border transition-all flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <FileText className="h-4 w-4" />
          View Statement
        </button>

        <button
          type="button"
          disabled
          title="Withdrawal functionality coming soon"
          className="px-4 py-2.5 rounded-xl bg-muted/50 text-muted-foreground font-semibold text-xs border border-border/60 flex items-center gap-2 cursor-not-allowed opacity-60"
        >
          <Building2 className="h-4 w-4" />
          Withdraw to Bank
          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-border/60">
            Soon
          </span>
        </button>
      </div>
    </div>
  )
}

export default WalletHeroCard
