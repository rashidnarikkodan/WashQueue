import {
  X,
  AlertTriangle,
  RefreshCw,
  Building2,
  User,
  Car,
  CreditCard,
  ShieldAlert,
  RotateCcw,
} from "lucide-react"
import { SettlementStatusBadge } from "@/shared/components/badges"
import type { Settlement } from "@/shared/apis/settlement.api"

interface SettlementDetailModalProps {
  settlement: Settlement | null
  isOpen: boolean
  onClose: () => void
  isAdmin?: boolean
  onRetry?: (id: string) => Promise<void>
  isRetrying?: boolean
}

export function SettlementDetailModal({
  settlement,
  isOpen,
  onClose,
  isAdmin = false,
  onRetry,
  isRetrying = false,
}: SettlementDetailModalProps) {
  if (!isOpen || !settlement) return null

  const commissionPercent = settlement.platformCommissionRate
    ? `${(settlement.platformCommissionRate * 100).toFixed(0)}%`
    : settlement.totalAmount > 0
      ? `${((settlement.platformCommission / settlement.totalAmount) * 100).toFixed(0)}%`
      : "10%"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card text-card-foreground rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">Settlement Statement</h3>
              <SettlementStatusBadge status={settlement.status} size="md" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Ref: {settlement.id || settlement.bookingId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Diagnostic Banner if HELD or FAILED */}
          {settlement.status === "HELD" && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold">Payout Held</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {settlement.holdReason === "MISSING_PAYOUT_ACCOUNT"
                    ? "Your station payout is on hold because a verified bank or payment transfer account is not yet configured. Payouts will resume automatically once setup is complete."
                    : settlement.holdReason ||
                      "This settlement is currently on hold by platform administrator."}
                </p>
              </div>
            </div>
          )}

          {settlement.status === "FAILED" && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold">Transfer Failed</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {settlement.failureReason ||
                    "Payment transfer failed during communication with bank/payment gateway."}
                </p>
                {settlement.retryCount > 0 && (
                  <p className="text-xs text-destructive mt-1 font-mono">
                    Retried {settlement.retryCount} times. Last attempt:{" "}
                    {settlement.lastRetriedAt
                      ? new Date(settlement.lastRetriedAt).toLocaleString()
                      : "N/A"}
                  </p>
                )}
              </div>
            </div>
          )}

          {settlement.status === "REVERSED" && (
            <div className="p-4 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-300 flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold">Payout Reversed</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {settlement.failureReason ||
                    "This payout was previously processed but was later reversed by the bank or payment gateway."}
                </p>
              </div>
            </div>
          )}

          {/* Financial Breakdown Card */}
          <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Financial Breakdown
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gross Booking Revenue</span>
                <span className="font-semibold text-foreground">
                  ₹{settlement.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Platform Commission ({commissionPercent})
                </span>
                <span className="font-semibold text-destructive">
                  - ₹{settlement.platformCommission.toFixed(2)}
                </span>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="font-bold text-foreground">Net Station Settlement</span>
                <span className="text-xl font-extrabold text-emerald-500">
                  ₹{settlement.stationSettlementAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payout Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>Payout Info</span>
              </div>
              <div className="text-sm">
                <p className="text-xs text-muted-foreground">Payout Reference</p>
                <p className="font-mono font-medium text-foreground truncate">
                  {settlement.payoutId || "Not generated yet"}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-xs text-muted-foreground">Processed At</p>
                <p className="font-medium text-foreground">
                  {settlement.processedAt
                    ? new Date(settlement.processedAt).toLocaleString()
                    : "Pending Payout"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Station & Service</span>
              </div>
              <div className="text-sm">
                <p className="text-xs text-muted-foreground">Station</p>
                <p className="font-medium text-foreground truncate">
                  {settlement.stationName || "Service Station"}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-xs text-muted-foreground">Service Type</p>
                <p className="font-medium text-foreground">
                  {settlement.serviceName || "Standard Wash"}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Metadata */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Booking Details
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-primary" /> Booking #
                </span>
                <span className="font-mono font-medium text-foreground block mt-0.5">
                  {settlement.bookingNumber || settlement.bookingId}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3 text-primary" /> Customer
                </span>
                <span className="font-medium text-foreground block mt-0.5">
                  {settlement.customerName || "Customer"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Car className="w-3 h-3 text-primary" /> Vehicle Reg
                </span>
                <span className="font-mono font-medium text-foreground block mt-0.5">
                  {settlement.vehicleRegNumber || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          <div className="text-xs text-muted-foreground">
            Created: {new Date(settlement.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && settlement.status === "FAILED" && onRetry && (
              <button
                onClick={() => onRetry(settlement.id)}
                disabled={isRetrying}
                className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 disabled:opacity-50 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
                {isRetrying ? "Retrying..." : "Retry Payout"}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-foreground bg-muted hover:bg-muted/80 border border-border rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
