import React from "react"
import { FileText, X, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import type { WalletTransactionItem } from "@/shared/apis/wallet.api"

interface StatementModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: WalletTransactionItem[]
  isLoading: boolean
}

export const StatementModal: React.FC<StatementModalProps> = ({
  isOpen,
  onClose,
  transactions,
  isLoading,
}) => {
  if (!isOpen) return null

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
        className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border hover:border-border/80 transition-all"
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border text-card-foreground rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Wallet Statement</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading statement...</div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No transactions to show.
            </div>
          ) : (
            transactions.map(renderTransactionRow)
          )}
        </div>
      </div>
    </div>
  )
}

export default StatementModal
