import React from "react"
import {
  FileText,
  Download,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import type { WalletTransactionItem } from "@/shared/apis/wallet.api"

interface TransactionHistoryTableProps {
  transactions: WalletTransactionItem[]
  isLoading: boolean
  activeFilter: string
  onFilterChange: (filterId: string) => void
  onExport: () => void
  isExporting: boolean
  currentPage: number
  pageSize: number
  totalPages: number
  totalRecords: number
  onPageChange: (newPage: number) => void
}

export const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  transactions,
  isLoading,
  activeFilter,
  onFilterChange,
  onExport,
  isExporting,
  currentPage,
  pageSize,
  totalPages,
  totalRecords,
  onPageChange,
}) => {
  const filterTabs = [
    { id: "ALL", label: "All" },
    { id: "DEBIT", label: "Payments" },
    { id: "REFUND", label: "Refunds" },
    { id: "CREDIT", label: "Credits / Top-ups" },
  ]

  const renderTransactionRow = (tx: WalletTransactionItem) => {
    const isCredit =
      tx.type === "CREDIT" ||
      tx.type === "REFUND" ||
      tx.category === "REFUND" ||
      tx.category === "TOP_UP" ||
      tx.category === "CASHBACK"
    const isRefund = tx.category === "REFUND" || tx.type === "REFUND"
    const defaultTitle = isRefund
      ? "Refund"
      : isCredit
      ? "Wallet Credit"
      : "Payment"

    return (
      <div
        key={tx.id}
        className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border hover:border-border/80 transition-all shadow-xs"
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center border shrink-0 ${
              isCredit
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
            }`}
          >
            {isCredit ? (
              <ArrowDownLeft className="h-4.5 w-4.5" />
            ) : (
              <ArrowUpRight className="h-4.5 w-4.5" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground">
              {tx.description || defaultTitle}
            </h4>
            <p className="text-xs text-muted-foreground">
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
              isCredit ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {isCredit ? "+" : "-"}₹{tx.amount.toFixed(2)}
          </p>
          <span
            className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
              tx.status === "COMPLETED"
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                : tx.status === "FAILED"
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
            }`}
          >
            {tx.status}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-6 shadow-md">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Transaction History</h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded-lg bg-muted hover:bg-muted/70 text-xs font-semibold text-foreground border border-border flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
            title="Export wallet transactions as Excel/CSV"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : (
              <Download className="h-3.5 w-3.5 text-primary" />
            )}
            <span>{isExporting ? "Exporting..." : "Export Excel"}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              activeFilter === tab.id
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Loading transactions...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm space-y-2">
            <Sparkles className="h-8 w-8 text-muted-foreground/60 mx-auto" />
            <p>No transactions found for this filter.</p>
          </div>
        ) : (
          transactions.map(renderTransactionRow)
        )}
      </div>

      {/* Pagination Controls */}
      {totalRecords > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60 text-xs text-muted-foreground">
          <span>
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalRecords)} to{" "}
            {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} transactions
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-semibold transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border font-bold text-foreground">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-semibold transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionHistoryTable
