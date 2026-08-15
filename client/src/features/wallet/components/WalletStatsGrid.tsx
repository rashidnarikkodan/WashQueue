import React from "react"

interface WalletStatsGridProps {
  totalTransactionsCount: number
  totalSpentAmount: number
  totalRefundAmount: number
  statusText?: string
}

export const WalletStatsGrid: React.FC<WalletStatsGridProps> = ({
  totalTransactionsCount,
  totalSpentAmount,
  totalRefundAmount,
  statusText = "Verified",
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="rounded-2xl bg-card p-5 border border-border space-y-1 shadow-sm">
        <span className="text-xs font-medium text-muted-foreground">Total Transactions</span>
        <p className="text-xl sm:text-2xl font-bold text-foreground">{totalTransactionsCount}</p>
      </div>

      <div className="rounded-2xl bg-card p-5 border border-border space-y-1 shadow-sm">
        <span className="text-xs font-medium text-muted-foreground">Total Spent</span>
        <p className="text-xl sm:text-2xl font-bold text-foreground">₹{totalSpentAmount.toFixed(2)}</p>
      </div>

      <div className="rounded-2xl bg-card p-5 border border-border space-y-1 shadow-sm">
        <span className="text-xs font-medium text-muted-foreground">Total Refunds</span>
        <p className="text-xl sm:text-2xl font-bold text-foreground">₹{totalRefundAmount.toFixed(2)}</p>
      </div>

      <div className="rounded-2xl bg-card p-5 border border-border space-y-1 shadow-sm">
        <span className="text-xs font-medium text-muted-foreground">Wallet Status</span>
        <p className="text-xl sm:text-2xl font-bold text-emerald-500">{statusText}</p>
      </div>
    </div>
  )
}

export default WalletStatsGrid
