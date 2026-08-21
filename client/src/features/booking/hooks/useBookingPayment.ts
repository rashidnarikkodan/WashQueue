import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { paymentApi } from "@/shared/apis/payment.api"
import { walletApi } from "@/shared/apis/wallet.api"
import type { BookingResponse } from "@/shared/apis/booking.api"
import { PAYMENT_METHOD } from "@/shared/constants/payment.constants"

declare global {
  interface Window {
    Razorpay: new (options: unknown) => {
      open: () => void
      on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void
    }
  }
}

export interface BookingIntentPayload {
  stationId: string
  vehicleId: string
  timeWindowId: string
  serviceType: "HALF" | "FULL" | string
  extraServiceIds?: string[]
  paymentType?: string
}

export interface PaymentSuccessResult {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
  booking?: BookingResponse
}

export interface InitiatePaymentParams {
  totalAmount: number
  serviceName?: string
  bookingIntentData?: BookingIntentPayload
  onSuccess: (result: PaymentSuccessResult) => void
  onError?: (errorMessage: string) => void
  onCancel?: () => void
}

export function useBookingPayment(isModalOpen = false) {
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "wallet">("upi")
  const [useWalletWithUpi, setUseWalletWithUpi] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [isLoadingWallet, setIsLoadingWallet] = useState(false)
  const [activeReservationId, setActiveReservationId] = useState<string | null>(null)

  const fetchWalletBalance = useCallback(async () => {
    setIsLoadingWallet(true)
    try {
      const wallet = await walletApi.getBalance()
      setWalletBalance(wallet.balance)
      return wallet.balance
    } catch {
      setWalletBalance(null)
      return null
    } finally {
      setIsLoadingWallet(false)
    }
  }, [])

  // Auto-fetch wallet balance whenever payment modal opens
  useEffect(() => {
    let ignore = false
    if (isModalOpen) {
      void Promise.resolve().then(async () => {
        if (ignore) return
        await fetchWalletBalance()
      })
    }
    return () => {
      ignore = true
    }
  }, [isModalOpen, fetchWalletBalance])

  const initiatePayment = useCallback(
    async ({
      totalAmount,
      serviceName = "Car Wash Booking",
      bookingIntentData,
      onSuccess,
      onError,
      onCancel,
    }: InitiatePaymentParams) => {
      if (totalAmount < 1) {
        toast.error("Minimum payment amount is ₹1.00 (100 paise)")
        return
      }

      setIsProcessing(true)

      try {
        // --- 1. WALLET METHOD PRE-CHECK ---
        if (selectedMethod === "wallet") {
          let currentBalance = walletBalance
          if (currentBalance === null) {
            currentBalance = await fetchWalletBalance()
            if (currentBalance === null) {
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

        // --- 2. CREATE ORDER & ATOMIC SLOT RESERVATION ---
        const shouldUseWallet = selectedMethod === "upi" && useWalletWithUpi

        const orderPayload = {
          amount: Math.round(totalAmount * 100),
          currency: "INR",
          useWallet: shouldUseWallet,
          ...(bookingIntentData
            ? {
              stationId: bookingIntentData.stationId,
              vehicleId: bookingIntentData.vehicleId,
              timeWindowId: bookingIntentData.timeWindowId,
              serviceType: (bookingIntentData.serviceType === "FULL_WASH" ||
                bookingIntentData.serviceType === "full"
                ? "FULL"
                : bookingIntentData.serviceType) as "HALF" | "FULL",
              extraServiceIds: bookingIntentData.extraServiceIds,
              paymentType: (bookingIntentData.paymentType || "ONLINE_FULL") as
                | "ONLINE_FULL"
                | "PAY_AT_STATION",
            }
            : {}),
        }

        const order = await paymentApi.createOrder(orderPayload)

        if (order.reservation_id) {
          setActiveReservationId(order.reservation_id)
        }

        // --- 3. EXECUTE DIRECT WALLET PAYMENT (100% from wallet) ---
        if (selectedMethod === "wallet" || order.amount === 0) {
          try {
            if (selectedMethod === "wallet") {
              await walletApi.payWithWallet({
                amount: totalAmount,
                referenceId: order.reservation_id || order.id,
                description: serviceName || "Wash Booking Payment",
              })
            }

            const walletPaymentId = `wallet_pay_${Date.now()}`
            const verification = await paymentApi.verifyPayment({
              razorpay_order_id: order.order_id,
              razorpay_payment_id: walletPaymentId,
              razorpay_signature: "wallet_payment_verified",
              paymentMethod: PAYMENT_METHOD.WALLET,
            })

            toast.success("Paid successfully using your Wallet balance!")
            onSuccess({
              razorpay_order_id: order.order_id,
              razorpay_payment_id: walletPaymentId,
              razorpay_signature: "wallet_payment_verified",
              booking: verification.booking,
            })
          } catch (walletErr: unknown) {
            const wErr = walletErr as { message?: string }
            if (order.reservation_id) {
              paymentApi.cancelReservation(order.reservation_id)
            }
            const errMsg = wErr.message || "Failed to process payment using wallet balance"
            toast.error(errMsg)
            onError?.(errMsg)
          } finally {
            setIsProcessing(false)
          }
          return
        }

        // --- 4. EXECUTE RAZORPAY PAYMENT (For remaining or full UPI amount) ---
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TMRUfl1mCLmihQ"

        if (typeof window.Razorpay === "undefined") {
          throw new Error(
            "Razorpay SDK is loading or unavailable. Please check your internet connection and try again."
          )
        }

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
              const verification = await paymentApi.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentMethod:
                  order.wallet_amount && order.wallet_amount > 0
                    ? PAYMENT_METHOD.WALLET_AND_ONLINE
                    : PAYMENT_METHOD.ONLINE,
              })

              if (verification.success) {
                toast.success("Payment verified and booking confirmed!")
                onSuccess({
                  ...response,
                  booking: verification.booking,
                })
              } else {
                onError?.(verification.message || "Payment verification failed")
              }
            } catch (err: unknown) {
              const errorObj = err as { code?: string; message?: string }
              if (
                errorObj.code === "RESERVATION_EXPIRED_REFUND_INITIATED" ||
                errorObj.message?.includes("refund")
              ) {
                onError?.("RESERVATION_EXPIRED_REFUND_INITIATED")
              } else {
                onError?.(errorObj.message || "Failed to verify payment signature")
              }
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
        })

        rzp.open()
      } catch (err: unknown) {
        const errorObj = err as { code?: string; message?: string }
        console.error("Error creating payment order:", err)
        setIsProcessing(false)

        if (
          errorObj.code === "SLOT_UNAVAILABLE" ||
          errorObj.message?.includes("SLOT_UNAVAILABLE") ||
          errorObj.message?.includes("available")
        ) {
          onError?.("SLOT_UNAVAILABLE")
          return
        }

        onError?.(errorObj.message || "Could not initiate payment. Please try again.")
      }
    },
    [selectedMethod, useWalletWithUpi, walletBalance, fetchWalletBalance, activeReservationId]
  )

  return {
    selectedMethod,
    setSelectedMethod,
    useWalletWithUpi,
    setUseWalletWithUpi,
    isProcessing,
    walletBalance,
    isLoadingWallet,
    fetchWalletBalance,
    initiatePayment,
  }
}
