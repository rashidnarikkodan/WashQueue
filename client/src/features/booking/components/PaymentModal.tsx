import { useState, useEffect } from "react"
import { X, Smartphone, Wallet, ArrowRight, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { paymentApi } from "@/shared/apis/payment.api"
import { walletApi } from "@/shared/apis/wallet.api"
import type { BookingResponse } from "@/shared/apis/booking.api"

declare global {
  interface Window {
    Razorpay: new (options: unknown) => {
      open: () => void
      on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void
    }
  }
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amountInRupees: number
  serviceName?: string
  bookingIntentData?: {
    stationId: string
    vehicleId: string
    timeWindowId: string
    serviceType: "HALF" | "FULL" | string
    extraServiceIds?: string[]
    paymentType?: string
  }
  onSuccess: (paymentData: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
    booking?: BookingResponse
  }) => void
  onError?: (error: string) => void
  onCancel?: () => void
}

export default function PaymentModal({
  isOpen,
  onClose,
  amountInRupees,
  serviceName = "Car Wash Booking",
  bookingIntentData,
  onSuccess,
  onError,
  onCancel,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "wallet">("upi")
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeReservationId, setActiveReservationId] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [isLoadingWallet, setIsLoadingWallet] = useState(false)

  // Fetch wallet balance upfront when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingWallet(true)
      walletApi
        .getBalance()
        .then((w) => setWalletBalance(w.balance))
        .catch(() => setWalletBalance(null))
        .finally(() => setIsLoadingWallet(false))
    }
  }, [isOpen])

  if (!isOpen) return null

  const totalAmount = amountInRupees || 0
  const subtotal = Math.max(0, totalAmount * 0.82)
  const taxesAndFees = Math.max(0, totalAmount - subtotal)

  const handlePaySecurely = async () => {
    if (totalAmount < 1) {
      toast.error("Minimum payment amount is ₹1.00 (100 paise)")
      return
    }

    setIsProcessing(true)

    try {
      // Pre-check Wallet Balance BEFORE creating order if Wallet method is selected
      if (selectedMethod === "wallet") {
        let currentBalance = walletBalance
        if (currentBalance === null) {
          try {
            const userWallet = await walletApi.getBalance()
            currentBalance = userWallet.balance
            setWalletBalance(currentBalance)
          } catch {
            toast.error("Failed to check wallet balance. Please try again.")
            setIsProcessing(false)
            return
          }
        }

        if (currentBalance < totalAmount) {
          toast.error(
            `Insufficient wallet balance (₹${currentBalance.toFixed(2)}). Please top up your wallet.`,
            {
              action: {
                label: "Go to Wallet",
                onClick: () => window.location.assign("/wallet"),
              },
            }
          )
          setIsProcessing(false)
          return
        }
      }

      // Step 1: Create Order & Atomic Slot Reservation on Backend
      const orderPayload = {
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        ...(bookingIntentData
          ? {
              stationId: bookingIntentData.stationId,
              vehicleId: bookingIntentData.vehicleId,
              timeWindowId: bookingIntentData.timeWindowId,
              serviceType: (bookingIntentData.serviceType === "FULL_WASH" || bookingIntentData.serviceType === "full" ? "FULL" : bookingIntentData.serviceType) as "HALF" | "FULL",
              extraServiceIds: bookingIntentData.extraServiceIds,
              paymentType: (bookingIntentData.paymentType || "ONLINE_FULL") as "ONLINE_FULL" | "PAY_AT_STATION",
            }
          : {}),
      }

      const order = await paymentApi.createOrder(orderPayload)

      if (order.reservation_id) {
        setActiveReservationId(order.reservation_id)
      }

      // Handle Direct Wallet Payment Flow (Balance already verified upfront)
      if (selectedMethod === "wallet") {
        try {
          // Debit wallet for booking
          await walletApi.payWithWallet({
            amount: totalAmount,
            referenceId: order.reservation_id || order.order_id,
            description: serviceName || "Wash Booking Payment",
          })

          // Verify & confirm booking; paymentMethod tells the server this was already
          // settled via wallet debit above, so it skips Razorpay signature verification.
          const walletPaymentId = `wallet_pay_${Date.now()}`
          const verification = await paymentApi.verifyPayment({
            razorpay_order_id: order.order_id,
            razorpay_payment_id: walletPaymentId,
            razorpay_signature: "wallet_payment_verified",
            paymentMethod: "WALLET",
          })

          toast.success("Paid successfully using your Wallet balance!")
          onSuccess({
            razorpay_order_id: order.order_id,
            razorpay_payment_id: walletPaymentId,
            razorpay_signature: "wallet_payment_verified",
            booking: verification.booking,
          })
          onClose()
        } catch (walletErr: unknown) {
          const wErr = walletErr as { message?: string }
          if (order.reservation_id) {
            paymentApi.cancelReservation(order.reservation_id)
          }
          const errMsg = wErr.message || "Failed to process payment using wallet balance"
          toast.error(errMsg)
          onError?.(errMsg)
          onClose()
        } finally {
          setIsProcessing(false)
        }
        return
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TMRUfl1mCLmihQ"

      if (typeof window.Razorpay === "undefined") {
        throw new Error(
          "Razorpay SDK is loading or unavailable. Please check your internet connection and try again."
        )
      }

      // Step 2: Open Razorpay Standard Checkout Modal
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "WashQueue",
        description: serviceName || "Car Wash Service Booking",
        order_id: order.order_id,
        handler: async function (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) {
          try {
            // Step 3: Verify Payment Signature & Confirm Booking on Backend
            const verification = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            if (verification.success) {
              toast.success("Payment verified and booking confirmed!")
              onSuccess({
                ...response,
                booking: verification.booking,
              })
              onClose()
            } else {
              onError?.(verification.message || "Payment verification failed")
              onClose()
            }
          } catch (err: unknown) {
            const errorObj = err as { code?: string; message?: string }
            if (errorObj.code === "RESERVATION_EXPIRED_REFUND_INITIATED" || errorObj.message?.includes("refund")) {
              onError?.("RESERVATION_EXPIRED_REFUND_INITIATED")
            } else {
              onError?.(errorObj.message || "Failed to verify payment signature")
            }
            onClose()
          } finally {
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false)
            if (activeReservationId || order.reservation_id) {
              paymentApi.cancelReservation(activeReservationId || order.reservation_id!)
            }
            onCancel?.()
          },
        },
        theme: {
          color: "#4D8EFF",
        },
      }

      const rzp = new window.Razorpay(options)

      rzp.on("payment.failed", function (response: { error?: { description?: string } }) {
        console.error("Razorpay Payment Failed:", response.error)
        setIsProcessing(false)
        if (order.reservation_id) {
          paymentApi.cancelReservation(order.reservation_id)
        }
        onError?.(response.error?.description || "Payment failed")
        onClose()
      })

      rzp.open()
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string }
      console.error("Error creating Razorpay payment order:", err)
      setIsProcessing(false)

      if (errorObj.code === "SLOT_UNAVAILABLE" || errorObj.message?.includes("SLOT_UNAVAILABLE") || errorObj.message?.includes("available")) {
        onError?.("SLOT_UNAVAILABLE")
        onClose()
        return
      }

      onError?.(errorObj.message || "Could not initiate payment. Please try again.")
      onClose()
    }
  }

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
            onClick={() => setSelectedMethod("upi")}
            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
              selectedMethod === "upi"
                ? "bg-slate-800/90 border-blue-400/80 shadow-[0_0_20px_rgba(77,142,255,0.15)]"
                : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
            }`}
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
            onClick={() => setSelectedMethod("wallet")}
            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
              selectedMethod === "wallet"
                ? "bg-slate-800/90 border-blue-400/80 shadow-[0_0_20px_rgba(77,142,255,0.15)]"
                : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
            }`}
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
            onClick={handlePaySecurely}
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
