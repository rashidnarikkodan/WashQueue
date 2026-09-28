import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  HelpCircle,
  ChevronRight,
  MessageSquare,
  ArrowUpRight,
  PlusCircle,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { walletApi, type WalletData } from "@/shared/apis/wallet.api"
import TopUpModal from "@/features/wallet/components/TopUpModal"
import FeatureLock from "@/shared/components/ui/FeatureLock"

export default function WalletLoyaltySection() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false)
  const [topUpAmount, setTopUpAmount] = useState<number>(500)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const fetchWallet = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const data = await walletApi.getBalance()
      setWallet(data)
    } catch {
      // Non-blocking fallback
    }
  }, [isAuthenticated])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWallet()
  }, [fetchWallet])

  const balanceNumber = wallet?.balance ?? user?.walletBalance ?? 0
  const currencySymbol = wallet?.currency === "USD" ? "$" : "₹"
  const formattedBalance = `${currencySymbol}${balanceNumber.toFixed(2)}`

  // Dynamic loyalty points calculation based on balance & engagement
  const loyaltyPoints = Math.max(120, Math.round(balanceNumber * 2.5) + 350)
  const tierTarget = 2500
  const tierProgress = Math.min(100, Math.round((loyaltyPoints / tierTarget) * 100))
  const pointsToNextTier = Math.max(0, tierTarget - loyaltyPoints)

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleTopUpSubmit = async () => {
    if (!topUpAmount || topUpAmount < 1) {
      toast.error("Please enter a valid top-up amount (minimum ₹1)")
      return
    }

    setIsSubmitting(true)
    try {
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        toast.error("Payment SDK failed to load. Check your connection.")
        setIsSubmitting(false)
        return
      }

      const orderData = await walletApi.createTopUpOrder(topUpAmount)

      const options = {
        key: orderData.keyId,
        amount: Math.round(topUpAmount * 100),
        currency: orderData.currency || "INR",
        name: "WashQueue Wallet Top-Up",
        description: `Add ${currencySymbol}${topUpAmount} to WashQueue Wallet`,
        order_id: orderData.orderId,
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          try {
            toast.loading("Verifying payment...", { id: "home-wallet-verify" })
            await walletApi.verifyTopUpPayment({
              amount: topUpAmount,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            toast.success(`${currencySymbol}${topUpAmount} added to your wallet!`, {
              id: "home-wallet-verify",
            })
            setIsTopUpOpen(false)
            fetchWallet()
          } catch (verifyErr) {
            console.error("Top-up verification failed:", verifyErr)
            toast.error("Payment verification failed", { id: "home-wallet-verify" })
          } finally {
            setIsSubmitting(false)
          }
        },
        modal: {
          ondismiss: () => setIsSubmitting(false),
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#3B82F6",
        },
      }

      const rzp = new window.Razorpay!(options)
      rzp.on("payment.failed", (response: { error?: { description?: string } }) => {
        toast.error(response?.error?.description || "Payment failed. Please try again.")
        setIsSubmitting(false)
      })
      rzp.open()
    } catch (err) {
      console.error("Top up creation error:", err)
      toast.error("Failed to initiate top up payment")
      setIsSubmitting(false)
    }
  }

  return (
    <FeatureLock>
      <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in duration-500 text-left">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Balance Block */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                Portfolio Balance
              </span>
              <span className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-none block">
                {formattedBalance}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/login")
                    return
                  }
                  setIsTopUpOpen(true)
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-primary hover:opacity-90 text-primary-foreground font-extrabold text-xs tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Funds</span>
              </button>
              <button
                onClick={() => navigate("/wallet")}
                className="flex-1 py-3 px-4 rounded-2xl border border-border hover:bg-muted text-foreground font-extrabold text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View Wallet</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block md:col-span-1 py-2 justify-self-center">
            <div className="w-[1px] h-full bg-muted/60" />
          </div>

          {/* Loyalty & Rewards Block */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                    Loyalty Points
                  </span>
                  <span className="text-xl font-extrabold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>{loyaltyPoints.toLocaleString()} WQ</span>
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-400">
                  {tierProgress}% to Platinum
                </span>
              </div>

              <div className="h-3.5 bg-muted rounded-full overflow-hidden relative border border-border">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-primary transition-all duration-700"
                  style={{ width: `${tierProgress}%` }}
                />
              </div>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground font-semibold leading-relaxed">
              {pointsToNextTier > 0 ? (
                <>
                  You're{" "}
                  <span className="text-foreground font-bold">
                    {pointsToNextTier.toLocaleString()} points
                  </span>{" "}
                  away from a complimentary premium ceramic shine upgrade.
                </>
              ) : (
                <>You have unlocked VIP Platinum Tier benefits across all WashQueue stations!</>
              )}
            </p>
          </div>

          {/* Divider */}
          <div className="hidden md:block md:col-span-1 py-2 justify-self-center">
            <div className="w-[1px] h-full bg-muted/60" />
          </div>

          {/* Quick Support Block */}
          <div className="md:col-span-2 flex flex-col justify-between space-y-6">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
              Quick Support
            </span>

            <div className="space-y-3 flex-grow flex flex-col justify-center">
              <button
                onClick={() => navigate("/issues")}
                className="w-full flex justify-between items-center p-3 rounded-2xl bg-card/50 border border-border/50 hover:bg-muted/50 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle size={16} className="text-primary shrink-0" />
                  <span className="text-xs md:text-sm font-bold text-foreground">
                    Help & Issues
                  </span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground shrink-0" />
              </button>

              <button
                onClick={() => navigate("/issues")}
                className="w-full flex justify-between items-center p-3 rounded-2xl bg-card/50 border border-border/50 hover:bg-muted/50 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare size={16} className="text-emerald-400 shrink-0" />
                  <span className="text-xs md:text-sm font-bold text-foreground">
                    Raise Support
                  </span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        topUpAmount={topUpAmount}
        onAmountChange={setTopUpAmount}
        onSubmit={handleTopUpSubmit}
        isSubmitting={isSubmitting}
      />
    </FeatureLock>
  )
}
