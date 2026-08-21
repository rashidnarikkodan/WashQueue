import { X, Smartphone, Wallet, ArrowRight, ShieldCheck, Check, Sparkles } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amountInRupees: number
  selectedMethod: "upi" | "wallet"
  onSelectMethod: (method: "upi" | "wallet") => void
  useWalletWithUpi: boolean
  onToggleUseWalletWithUpi: (val: boolean) => void
  walletBalance: number | null
  isLoadingWallet: boolean
  isProcessing: boolean
  onPaySecurely: () => void
}

export default function PaymentModal({
  isOpen,
  onClose,
  amountInRupees,
  selectedMethod,
  onSelectMethod,
  useWalletWithUpi,
  onToggleUseWalletWithUpi,
  walletBalance,
  isLoadingWallet,
  isProcessing,
  onPaySecurely,
}: PaymentModalProps) {
  if (!isOpen) return null

  const totalAmount = amountInRupees || 0
  const subtotal = Math.max(0, totalAmount * 0.82)
  const taxesAndFees = Math.max(0, totalAmount - subtotal)

  const availableWallet = walletBalance && walletBalance > 0 ? walletBalance : 0
  const isWalletEligibleForUpi = selectedMethod === "upi" && availableWallet > 0
  const walletDeduction =
    isWalletEligibleForUpi && useWalletWithUpi ? Math.min(availableWallet, totalAmount) : 0
  const netPayableViaUpi = Math.max(0, totalAmount - walletDeduction)

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-[560px] rounded-3xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden flex flex-col my-8">
        <div className="flex items-start justify-between p-6 sm:p-8 pb-4 border-b border-border">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Choose Payment Method
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Complete your booking securely</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          <div
            className={`rounded-2xl transition-all border overflow-hidden ${
              selectedMethod === "upi"
                ? "bg-primary/10 border-primary/50 shadow-md shadow-primary/5"
                : "bg-card border-border hover:border-primary/30"
            } ${isProcessing ? "opacity-60 pointer-events-none" : ""}`}
          >
            <div
              onClick={() => !isProcessing && onSelectMethod("upi")}
              className="flex items-center gap-4 p-4 cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  selectedMethod === "upi"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Smartphone size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">UPI Payment</h3>
                <p className="text-xs text-muted-foreground">Pay using GPay, PhonePe, Paytm, or BHIM</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedMethod === "upi" ? "border-primary bg-primary" : "border-border"
                }`}
              >
                {selectedMethod === "upi" && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
              </div>
            </div>

            {selectedMethod === "upi" && (
              <div className="px-4 pb-4 pt-1">
                {isLoadingWallet ? (
                  <div className="p-3 rounded-xl bg-muted/50 border border-border flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                    <Wallet size={14} />
                    <span>Checking wallet balance for discount...</span>
                  </div>
                ) : availableWallet > 0 ? (
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex flex-col gap-2.5 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                          <Wallet size={15} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground">
                              Use Wallet Balance
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              ₹{availableWallet.toFixed(2)} Available
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {useWalletWithUpi
                              ? `Deducting ₹${Math.min(availableWallet, totalAmount).toFixed(2)} from wallet`
                              : "Apply wallet money to reduce UPI payable amount"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isProcessing) {
                            onToggleUseWalletWithUpi(!useWalletWithUpi)
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                          useWalletWithUpi
                            ? "bg-emerald-500"
                            : "bg-muted-foreground/30 hover:bg-muted-foreground/40"
                        }`}
                        role="switch"
                        aria-checked={useWalletWithUpi}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out flex items-center justify-center ${
                            useWalletWithUpi ? "translate-x-6" : "translate-x-1"
                          }`}
                        >
                          {useWalletWithUpi && <Check size={10} className="text-emerald-700 stroke-[3]" />}
                        </span>
                      </button>
                    </div>

                    {useWalletWithUpi && (
                      <div className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={12} className="text-emerald-500" />
                          <span>Split Payment Applied</span>
                        </div>
                        <span className="font-semibold">
                          ₹{walletDeduction.toFixed(2)} Wallet + ₹{netPayableViaUpi.toFixed(2)} UPI
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Wallet size={13} />
                      <span>Wallet balance is ₹0.00</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground/70">Top-up from profile to save</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            onClick={() => !isProcessing && onSelectMethod("wallet")}
            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
              selectedMethod === "wallet"
                ? "bg-primary/10 border-primary/50 shadow-md shadow-primary/5"
                : "bg-card border-border hover:border-primary/30"
            } ${isProcessing ? "opacity-60 pointer-events-none" : ""}`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                selectedMethod === "wallet"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Wallet size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Wallet Direct</h3>
                {isLoadingWallet ? (
                  <span className="text-[10px] text-muted-foreground animate-pulse">Checking...</span>
                ) : walletBalance !== null ? (
                  <span
                    className={`text-xs font-bold ${
                      walletBalance < totalAmount ? "text-destructive" : "text-emerald-500"
                    }`}
                  >
                    Bal: ₹{walletBalance.toFixed(2)}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {walletBalance !== null && walletBalance < totalAmount ? (
                  <span className="text-destructive font-medium">Insufficient full balance (use UPI split above)</span>
                ) : (
                  "Direct 100% payment from your app wallet"
                )}
              </p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedMethod === "wallet" ? "border-primary bg-primary" : "border-border"
              }`}
            >
              {selectedMethod === "wallet" && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-muted/40 border-t border-border space-y-5">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-foreground font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Taxes & Fees</span>
              <span className="text-foreground font-medium">₹{taxesAndFees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Total Booking Amount</span>
              <span className="text-foreground font-semibold">₹{totalAmount.toFixed(2)}</span>
            </div>

            {selectedMethod === "upi" && useWalletWithUpi && walletDeduction > 0 && (
              <div className="flex justify-between text-emerald-500 pt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Wallet size={13} />
                  <span>Wallet Balance Applied</span>
                </span>
                <span className="font-bold">-₹{walletDeduction.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2.5 border-t border-border text-foreground">
              <div>
                <span className="text-base font-bold">
                  {selectedMethod === "upi" && useWalletWithUpi && walletDeduction > 0
                    ? "Payable via UPI"
                    : "Final Amount"}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">
                  <ShieldCheck size={12} />
                  <span>Secure Transaction</span>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-primary font-sans">
                ₹
                {(selectedMethod === "upi" && useWalletWithUpi && walletDeduction > 0
                  ? netPayableViaUpi
                  : totalAmount
                ).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onPaySecurely}
            disabled={isProcessing}
            className="w-full py-4 rounded-full bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>
              {isProcessing
                ? "Initiating Payment..."
                : selectedMethod === "upi" && useWalletWithUpi && walletDeduction > 0
                  ? netPayableViaUpi > 0
                    ? `Pay ₹${netPayableViaUpi.toFixed(2)} via UPI`
                    : `Pay ₹${totalAmount.toFixed(2)} from Wallet`
                  : selectedMethod === "wallet"
                    ? `Pay ₹${totalAmount.toFixed(2)} from Wallet`
                    : `Pay ₹${totalAmount.toFixed(2)} via UPI`}
            </span>
            {!isProcessing && <ArrowRight size={18} />}
          </button>

          <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wide">
            PAYMENTS ARE SECURELY PROCESSED AND VERIFIED BEFORE BOOKING CONFIRMATION
          </p>
        </div>
      </div>
    </div>
  )
}
