import { HelpCircle, ChevronRight, MessageSquare } from "lucide-react"
import { useAuthStore } from "@/features/auth/store/authStore"
import { MOCK_DASHBOARD_DATA } from "../../mock/dashboard.mock"
import FeatureLock from "@/shared/components/ui/FeatureLock"

export default function WalletLoyaltySection() {
  const { user } = useAuthStore()
  const data = MOCK_DASHBOARD_DATA

  // Use either the real user wallet balance or mock
  const walletBalance =
    user?.walletBalance !== undefined ? `$${user.walletBalance.toFixed(2)}` : data.wallet.balance

  return (
    <FeatureLock>
      {/* Wallet & Loyalty Rewards Support Grid */}
      <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in duration-500 text-left">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Balance panel */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                Portfolio Balance
              </span>
              <span className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-none block">
                {walletBalance}
              </span>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-3 px-5 rounded-2xl bg-white hover:bg-slate-100 text-primary-foreground font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-md">
                Add Funds
              </button>
              <button className="flex-1 py-3 px-5 rounded-2xl border border-border hover:bg-muted text-foreground font-extrabold text-xs tracking-wider transition-all cursor-pointer">
                Withdraw
              </button>
            </div>
          </div>

          {/* vertical dividing line */}
          <div className="hidden md:block md:col-span-1 py-2 justify-self-center">
            <div className="w-[1px] h-full bg-muted/60" />
          </div>

          {/* Loyalty points details */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                    Loyalty Points
                  </span>
                  <span className="text-xl font-extrabold text-foreground">
                    {data.wallet.loyaltyPoints}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-400">
                  {data.wallet.tierProgress}% to Platinum
                </span>
              </div>

              {/* Custom Gradient Progress Bar */}
              <div className="h-3.5 bg-muted rounded-full overflow-hidden relative border border-slate-900">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-primary"
                  style={{ width: `${data.wallet.tierProgress}%` }}
                />
              </div>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground font-semibold leading-relaxed">
              {data.wallet.rewardDetails}
            </p>
          </div>

          {/* vertical dividing line */}
          <div className="hidden md:block md:col-span-1 py-2 justify-self-center">
            <div className="w-[1px] h-full bg-muted/60" />
          </div>

          {/* Support section */}
          <div className="md:col-span-2 flex flex-col justify-between space-y-6">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
              Quick Support
            </span>

            <div className="space-y-3 flex-grow flex flex-col justify-center">
              <a
                href="/help"
                className="flex justify-between items-center p-3 rounded-2xl bg-card/50 border border-border/50 hover:bg-card transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle size={16} className="text-muted-foreground" />
                  <span className="text-xs md:text-sm font-bold text-foreground">Help Center</span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </a>

              <a
                href="/chat"
                className="flex justify-between items-center p-3 rounded-2xl bg-card/50 border border-border/50 hover:bg-card transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare size={16} className="text-muted-foreground" />
                  <span className="text-xs md:text-sm font-bold text-foreground">Live Agent</span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </FeatureLock>
  )
}
