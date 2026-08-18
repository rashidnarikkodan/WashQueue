import { X, Smartphone, Wallet, ArrowRight, ShieldCheck } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amountInRupees: number
  selectedMethod: "upi" | "wallet"
  onSelectMethod: (method: "upi" | "wallet") => void
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
  walletBalance,
  isLoadingWallet,
  isProcessing,
  onPaySecurely,
}: PaymentModalProps) {
  if (!isOpen) return null

  const totalAmount = amountInRupees || 0
  const subtotal = Math.max(0, totalAmount * 0.82)
  const taxesAndFees = Math.max(0, totalAmount - subtotal)

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-[560px] rounded-3xl border border-border/40 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden flex flex-col my-8 border-slate-700/50">
        {/* Header */}
        <div className="flex items-start justify-between p-6 sm:p-8 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Choose Payment Method
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Complete your booking securely</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Payment Methods */}
        <div className="p-6 sm:p-8 space-y-4">
          {/* Option 1: UPI Payment */}
          <div
            onClick={() => !isProcessing && onSelectMethod("upi")}
            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
              selectedMethod === "upi"
                ? "bg-slate-800/90 border-blue-400/80 shadow-[0_0_20px_rgba(77,142,255,0.15)]"
                : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
            } ${isProcessing ? "opacity-60 pointer-events-none" : ""}`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedMethod === "upi"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              <Smartphone size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-100">UPI Payment</h3>
              <p className="text-xs text-slate-400">Pay using GPay, PhonePe, or BHIM</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === "upi" ? "border-blue-400 bg-blue-400" : "border-slate-600"
              }`}
            >
              {selectedMethod === "upi" && <div className="w-2 h-2 rounded-full bg-slate-950" />}
            </div>
          </div>

          {/* Option 2: Wallet */}
          <div
            onClick={() => !isProcessing && onSelectMethod("wallet")}
            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
              selectedMethod === "wallet"
                ? "bg-slate-800/90 border-blue-400/80 shadow-[0_0_20px_rgba(77,142,255,0.15)]"
                : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
            } ${isProcessing ? "opacity-60 pointer-events-none" : ""}`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedMethod === "wallet"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              <Wallet size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100">Wallet</h3>
                {isLoadingWallet ? (
                  <span className="text-[10px] text-slate-400 animate-pulse">Checking...</span>
                ) : walletBalance !== null ? (
                  <span
                    className={`text-xs font-bold ${
                      walletBalance < totalAmount ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    Bal: ₹{walletBalance.toFixed(2)}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {walletBalance !== null && walletBalance < totalAmount ? (
                  <span className="text-rose-400 font-medium">Insufficient balance for this booking</span>
                ) : (
                  "Direct transfer from your app wallet"
                )}
              </p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === "wallet" ? "border-blue-400 bg-blue-400" : "border-slate-600"
              }`}
            >
              {selectedMethod === "wallet" && <div className="w-2 h-2 rounded-full bg-slate-950" />}
            </div>
          </div>
        </div>

        {/* Total & CTA Section */}
        <div className="p-6 sm:p-8 bg-slate-950/80 border-t border-slate-800 space-y-5">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="text-slate-200 font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Taxes & Fees</span>
              <span className="text-slate-200 font-medium">₹{taxesAndFees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 text-slate-100">
              <div>
                <span className="text-base font-bold">Total Amount</span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                  <ShieldCheck size={12} />
                  <span>Secure Transaction</span>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-blue-400">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onPaySecurely}
            disabled={isProcessing}
            className="w-full py-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{isProcessing ? "Initiating Payment..." : "Pay Securely"}</span>
            {!isProcessing && <ArrowRight size={18} />}
          </button>

          <p className="text-[10px] text-center text-slate-500 uppercase tracking-wide">
            PAYMENTS ARE SECURELY PROCESSED AND VERIFIED BEFORE BOOKING CONFIRMATION
          </p>
        </div>
      </div>
    </div>
  )
}
