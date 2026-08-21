import { useState, useEffect, useCallback, useMemo } from "react"
import { Wallet as WalletIcon, PlusCircle } from "lucide-react"
import { toast } from "sonner"
import { walletApi } from "@/shared/apis/wallet.api"
import type { WalletData, WalletTransactionItem } from "@/shared/apis/wallet.api"

import { WalletHeroCard } from "../components/WalletHeroCard"
import { RefundTrackerCard } from "../components/RefundTrackerCard"
import { WalletStatsGrid } from "../components/WalletStatsGrid"
import { TransactionHistoryTable } from "../components/TransactionHistoryTable"
import { TopUpModal } from "../components/TopUpModal"
import { StatementModal } from "../components/StatementModal"

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTxLoading, setIsTxLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>("ALL")

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize] = useState<number>(10)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [isExporting, setIsExporting] = useState<boolean>(false)

  const [isTopUpOpen, setIsTopUpOpen] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState<number>(500)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isStatementOpen, setIsStatementOpen] = useState(false)
  const [statementTransactions, setStatementTransactions] = useState<WalletTransactionItem[]>([])
  const [isStatementLoading, setIsStatementLoading] = useState(false)

  const fetchWallet = useCallback(async () => {
    try {
      const data = await walletApi.getBalance()
      setWallet(data)
    } catch (err) {
      console.error("Failed to load wallet balance", err)
      toast.error("Failed to load wallet balance")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchTransactions = useCallback(
    async (filterType: string, pageNum: number) => {
      setIsTxLoading(true)
      try {
        const queryParams: Record<string, unknown> = { page: pageNum, limit: pageSize }
        if (filterType === "CREDIT") queryParams.type = "CREDIT"
        if (filterType === "DEBIT") queryParams.type = "DEBIT"
        if (filterType === "REFUND") queryParams.category = "REFUND"
        if (filterType === "TOP_UP") queryParams.category = "TOP_UP"

        const res = await walletApi.getTransactions(queryParams)
        setTransactions(res.data || [])
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1)
          setTotalRecords(res.pagination.total || (res.data ? res.data.length : 0))
        }
      } catch (err) {
        console.error("Failed to load transaction history", err)
        toast.error("Failed to load transaction history")
      } finally {
        setIsTxLoading(false)
      }
    },
    [pageSize]
  )

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchWallet()
      if (ignore) return
      await fetchTransactions(activeFilter, currentPage)
    })
    return () => {
      ignore = true
    }
  }, [fetchWallet, fetchTransactions, activeFilter, currentPage])

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      const queryParams: Record<string, unknown> = {}
      if (activeFilter === "CREDIT") queryParams.type = "CREDIT"
      if (activeFilter === "DEBIT") queryParams.type = "DEBIT"
      if (activeFilter === "REFUND") queryParams.category = "REFUND"
      if (activeFilter === "TOP_UP") queryParams.category = "TOP_UP"

      const blob = await walletApi.exportTransactions(queryParams)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `wallet-transactions-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success("Wallet transactions exported successfully!")
    } catch (err) {
      console.error("Export failed:", err)
      toast.error("Failed to export wallet transactions")
    } finally {
      setIsExporting(false)
    }
  }

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
            fetchTransactions(activeFilter, currentPage)
          } catch (verifyErr) {
            console.error("Top-up verification failed:", verifyErr)
            toast.error("Payment verification failed", { id: "wallet-verify" })
          } finally {
            setIsSubmitting(false)
          }
        },
        modal: {
          ondismiss: () => setIsSubmitting(false),
        },
        prefill: {},
        theme: {
          color: "#3B82F6",
        },
      }

      const rzp = new window.Razorpay!(options)
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.")
        setIsSubmitting(false)
      })
      rzp.open()
    } catch (err) {
      console.error("Top up creation error:", err)
      toast.error("Failed to initiate top up payment")
      setIsSubmitting(false)
    }
  }

  const handleOpenStatement = async () => {
    setIsStatementOpen(true)
    setIsStatementLoading(true)
    try {
      const res = await walletApi.getTransactions({ limit: 100 })
      setStatementTransactions(res.data || [])
    } catch (err) {
      console.error("Failed to load wallet statement", err)
      toast.error("Failed to load wallet statement")
    } finally {
      setIsStatementLoading(false)
    }
  }

  const totalTransactionsCount = totalRecords || transactions.length
  const totalSpentAmount = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === "DEBIT" && tx.category !== "REFUND" && tx.status === "COMPLETED")
      .reduce((acc, tx) => acc + tx.amount, 0)
  }, [transactions])

  const totalRefundAmount = useMemo(() => {
    return transactions
      .filter((tx) => (tx.category === "REFUND" || tx.type === "REFUND") && tx.status === "COMPLETED")
      .reduce((acc, tx) => acc + tx.amount, 0)
  }, [transactions])

  return (
    <div className="min-h-screen bg-background text-foreground pt-4 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <WalletIcon className="h-8 w-8 text-primary" />
              Wallet
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
              Manage your balance, top-up funds, instant booking payments, and refund history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              Add Money
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <WalletHeroCard
              wallet={wallet}
              isLoading={isLoading}
              onOpenTopUp={() => setIsTopUpOpen(true)}
              onOpenStatement={handleOpenStatement}
            />
          </div>

          <div className="lg:col-span-5">
            <RefundTrackerCard totalRefundAmount={totalRefundAmount} />
          </div>
        </div>

        <WalletStatsGrid
          totalTransactionsCount={totalTransactionsCount}
          totalSpentAmount={totalSpentAmount}
          totalRefundAmount={totalRefundAmount}
          statusText={wallet?.status || "Active"}
        />

        <TransactionHistoryTable
          transactions={transactions}
          isLoading={isTxLoading}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          onExport={handleExportExcel}
          isExporting={isExporting}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={handlePageChange}
        />
      </div>

      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        topUpAmount={topUpAmount}
        onAmountChange={setTopUpAmount}
        onSubmit={handleTopUpSubmit}
        isSubmitting={isSubmitting}
      />

      <StatementModal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        transactions={statementTransactions}
        isLoading={isStatementLoading}
      />
    </div>
  )
}
