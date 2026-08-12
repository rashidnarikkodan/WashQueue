import { useState, useEffect, useCallback } from "react"
import {
  Wallet as WalletIcon,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Clock,
  Building2,
  FileText,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import {
  walletApi,
} from "@/shared/apis/wallet.api"
import type {
  WalletData,
  WalletTransactionItem,
} from "@/shared/apis/wallet.api"

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTxLoading, setIsTxLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>("ALL")
  
  // Top-Up Modal State
  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState<number>(500)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch Wallet Balance
  const fetchWallet = useCallback(async (quiet = false) => {
    try {
      const data = await walletApi.getBalance()
      setWallet(data)
    } catch (err) {
      console.error("Failed to load wallet balance", err)
      if (!quiet) {
        toast.error("Failed to load wallet balance", {
          action: {
            label: "Retry",
            onClick: () => fetchWallet(false),
          },
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch Transactions with filter
  const fetchTransactions = useCallback(async (filterType: string, quiet = false) => {
    setIsTxLoading(true)
    try {
      const queryParams: Record<string, unknown> = { limit: 20 }
      if (filterType === "CREDIT") queryParams.type = "CREDIT"
      if (filterType === "DEBIT") queryParams.type = "DEBIT"
      if (filterType === "REFUND") queryParams.category = "REFUND"
      if (filterType === "TOP_UP") queryParams.category = "TOP_UP"

      const res = await walletApi.getTransactions(queryParams)
      setTransactions(res.data || [])
    } catch (err) {
      console.error("Failed to load transaction history", err)
      if (!quiet) {
        toast.error("Failed to load transaction history", {
          action: {
            label: "Retry",
            onClick: () => fetchTransactions(filterType, false),
          },
        })
      }
    } finally {
      setIsTxLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWallet()
    fetchTransactions(activeFilter)
  }, [fetchWallet, fetchTransactions, activeFilter])

  // Load Razorpay Script dynamically if needed
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
  };

  // Handle Top-Up Submission via Razorpay
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

      // Step 1: Create Top Up Order on Server
      const orderData = await walletApi.createTopUpOrder(topUpAmount)

      // Step 2: Open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency || "INR",
        name: "WashQueue Wallet Top-Up",
        description: `Add ₹${topUpAmount} to WashQueue Wallet`,
        order_id: orderData.orderId,
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          try {
            toast.loading("Verifying payment...", { id: "wallet-verify" })
            await walletApi.verifyTopUpPayment({
              amount: topUpAmount,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            toast.success(`₹${topUpAmount} added to your wallet!`, {
              id: "wallet-verify",
            })
            setIsTopUpOpen(false)
            fetchWallet()
            fetchTransactions(activeFilter)
          } catch (verifyErr) {
            console.error("Top-up verification failed:", verifyErr)
            toast.error("Payment verification failed", { id: "wallet-verify" })
          }
        },
        prefill: {},
        theme: {
          color: "#3B82F6",
        },
      }

      const rzp = new window.Razorpay!(options)
      rzp.open()
    } catch (err) {
      console.error("Top up creation error:", err)
      toast.error("Failed to initiate top up payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate Quick Metrics
  const totalTransactionsCount = transactions.length
  const totalSpentAmount = transactions
    .filter((tx) => tx.type === "DEBIT" && tx.status === "COMPLETED")
    .reduce((acc, tx) => acc + tx.amount, 0)
  const totalRefundAmount = transactions
    .filter((tx) => tx.category === "REFUND" && tx.status === "COMPLETED")
    .reduce((acc, tx) => acc + tx.amount, 0)

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Section - Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/60 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <WalletIcon className="h-8 w-8 text-blue-400" />
              Wallet
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
              Manage your balance, top-up funds, instant booking payments, and refund history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.info("Withdrawal request submitted. Verification in progress.")}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all border border-slate-700/60 flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="h-4 w-4 text-slate-400" />
              Withdraw Refund
            </button>
            <button
              onClick={() => setIsTopUpOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              Add Money
            </button>
          </div>
        </div>

        {/* Wallet Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Primary Balance Card */}
          <div className="lg:col-span-7 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#090D16] p-8 border border-slate-800 shadow-2xl flex flex-col justify-between min-h-[260px]">
            {/* Background Decorative Blur */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  AVAILABLE BALANCE
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active Wallet
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {isLoading ? "₹..." : `₹${wallet?.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "0.00"}`}
                </span>
                <span className="text-xs text-slate-400 font-medium">{wallet?.currency || "INR"}</span>
              </div>

              <p className="text-xs text-slate-400">
                Ready for one-click wash booking reservations & extra services.
              </p>
            </div>

            <div className="pt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setIsTopUpOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold text-xs border border-blue-500/30 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Funds
              </button>
              <button
                onClick={() => toast.info("Transfer to bank feature processing.")}
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700/60 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="h-3.5 w-3.5" />
                Transfer to Bank
              </button>
              <button
                onClick={() => setActiveFilter("ALL")}
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700/60 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                View Statement
              </button>
            </div>
          </div>

          {/* Secondary Balances & Refund Tracker */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            
            {/* Refund Balance Box */}
            <div className="rounded-2xl bg-[#0F172A] p-5 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-400">Total Refunded</h3>
                  <p className="text-lg font-bold text-white">₹{totalRefundAmount.toFixed(2)}</p>
                </div>
              </div>
              <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 px-2.5 py-1 rounded-md">
                Instant Credit
              </span>
            </div>

            {/* Refund in Progress Tracker */}
            <div className="rounded-2xl bg-[#090D16] p-5 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    REFUND TRACKER
                  </span>
                  <p className="text-sm font-bold text-white">Booking Cancellation Refunds</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Auto-Processed
                </span>
              </div>

              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-3/4 rounded-full shadow-[0_0_8px_rgba(74,225,118,0.5)]" />
              </div>

              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                Cancelled booking refunds are automatically credited back to your wallet instantly.
              </p>
            </div>

          </div>
        </div>

        {/* Quick Stats Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-[#0F172A] p-5 border border-slate-800/80 space-y-1">
            <span className="text-xs font-medium text-slate-400">Total Transactions</span>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalTransactionsCount}</p>
          </div>
          <div className="rounded-2xl bg-[#0F172A] p-5 border border-slate-800/80 space-y-1">
            <span className="text-xs font-medium text-slate-400">Total Spent</span>
            <p className="text-xl sm:text-2xl font-bold text-white">₹{totalSpentAmount.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-[#0F172A] p-5 border border-slate-800/80 space-y-1">
            <span className="text-xs font-medium text-slate-400">Total Refunds</span>
            <p className="text-xl sm:text-2xl font-bold text-white">₹{totalRefundAmount.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-[#0F172A] p-5 border border-slate-800/80 space-y-1">
            <span className="text-xs font-medium text-slate-400">Status</span>
            <p className="text-xl sm:text-2xl font-bold text-emerald-400">Verified</p>
          </div>
        </div>

        {/* Main Interactive Section: Transaction Ledger */}
        <div className="rounded-3xl bg-[#0F172A] border border-slate-800/80 p-6 sm:p-8 space-y-6">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Transaction History</h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => toast.info("Filter settings")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700/60 flex items-center gap-1.5 cursor-pointer"
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
              </button>
              <button
                onClick={() => toast.success("Statement export started")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700/60 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: "ALL", label: "All" },
              { id: "DEBIT", label: "Payments" },
              { id: "REFUND", label: "Refunds" },
              { id: "CREDIT", label: "Credits / Top-ups" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Transaction List */}
          <div className="space-y-3">
            {isTxLoading ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm space-y-2">
                <Sparkles className="h-8 w-8 text-slate-600 mx-auto" />
                <p>No transactions found for this filter.</p>
              </div>
            ) : (
              transactions.map((tx) => {
                const isCredit = tx.type === "CREDIT"
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#090D16] border border-slate-800/60 hover:border-slate-700/80 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center border ${
                          isCredit
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-slate-800 border-slate-700 text-slate-300"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="h-4.5 w-4.5" />
                        ) : (
                          <ArrowUpRight className="h-4.5 w-4.5" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {tx.description || (isCredit ? "Wallet Credit" : "Payment")}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          • <span className="uppercase text-[10px] font-semibold">{tx.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          isCredit ? "text-emerald-400" : "text-slate-200"
                        }`}
                      >
                        {isCredit ? "+" : "-"}₹{tx.amount.toFixed(2)}
                      </p>
                      <span
                        className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          tx.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : tx.status === "FAILED"
                            ? "bg-rose-500/10 text-rose-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>

      {/* Add Money Top-Up Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Add Funds to Wallet</h3>
              </div>
              <button
                onClick={() => setIsTopUpOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Enter Amount (INR)
              </label>
              
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 bg-[#090D16] border border-slate-700 rounded-xl text-2xl font-black text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="500"
                />
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      topUpAmount === amt
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800"
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                Funds will be immediately credited to your WashQueue wallet upon successful Razorpay payment.
              </span>
            </div>

            <button
              onClick={handleTopUpSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              {isSubmitting ? "Initiating Checkout..." : `Proceed to Pay ₹${topUpAmount}`}
            </button>

          </div>
        </div>
      )}

    </div>
  )
}
