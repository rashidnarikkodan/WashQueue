import { toast } from "sonner"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  QrCode,
  Keyboard,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { bookingApi } from "@/shared/apis/booking.api"
import { QrCameraScanner } from "../ui/QrCameraScanner"
import type { BookingResponse } from "@/shared/apis/booking.api"
import { useQueueBasePath } from "@/features/queue/hooks/useQueueBasePath"

export default function CheckInComponent() {
  const navigate = useNavigate()
  const basePath = useQueueBasePath()
  const [bookingIdInput, setBookingIdInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResponse | null>(null)

  const handleQrScanSuccess = async (scannedValue: string) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const res = await bookingApi.validateQr(scannedValue)
      toast.success("QR Verified! Navigating to Pre-Service Inspection...")
      setBookingIdInput("")
      navigate(`${basePath}/bookings/${res.id}/pre-inspection`)
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      console.error("QR Validation error:", err)
      toast.error(errorObj?.message || "Invalid or ineligible QR Admit Pass.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleManualCheckIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!bookingIdInput.trim()) {
      toast.error("Please enter a Booking ID or QR Token")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await bookingApi.validateQr(bookingIdInput.trim())
      toast.success("Booking Verified! Opening Pre-Service Inspection...")
      setBookingIdInput("")
      navigate(`${basePath}/bookings/${res.id}/pre-inspection`)
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      console.error("Validation error:", err)
      toast.error(errorObj?.message || "Failed to verify Booking ID or QR pass.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-6 relative overflow-hidden flex flex-col justify-between shadow-md text-card-foreground">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <QrCode className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Digital Check-In</h2>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              LIVE GATE SCANNER
            </span>
          </div>

          <QrCameraScanner
            onScanSuccess={handleQrScanSuccess}
            isProcessing={isSubmitting}
          />

          <div className="text-xs text-muted-foreground flex items-center gap-2 pt-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span>Scanning automatically registers vehicle arrival in FIFO queue.</span>
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-8 flex flex-col justify-between shadow-md text-card-foreground">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <Keyboard className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Manual Entry</h2>
              </div>
              <span className="text-xs text-muted-foreground font-medium">FALLBACK MODE</span>
            </div>

            <form onSubmit={handleManualCheckIn} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  ENTER BOOKING ID / QR TOKEN
                </label>
                <input
                  type="text"
                  value={bookingIdInput}
                  onChange={(e) => setBookingIdInput(e.target.value)}
                  placeholder="e.g. WQ-28472 or token_..."
                  className="w-full px-5 py-4 rounded-2xl bg-muted border border-border text-foreground font-mono text-base font-bold focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? "Verifying..." : "Verify & Complete Check-In"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="p-5 rounded-2xl bg-muted/50 border border-border space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-primary">
              <HelpCircle className="h-4 w-4" />
              <span>Need Assistance?</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              If the customer lost their QR pass, ask for their 10-digit phone number or registration number to search active booking records.
            </p>
          </div>
        </div>
      </div>

      {confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-3xl w-full max-w-md p-6 space-y-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-foreground">Customer Checked In!</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Booking #{confirmedBooking.bookingNumber} • Vehicle added to Queue
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted text-left text-xs space-y-2 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-bold text-foreground">
                  {confirmedBooking.vehicleDetails?.brand || "Car"} {confirmedBooking.vehicleDetails?.model || ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reg No:</span>
                <span className="font-mono font-bold text-primary">
                  {confirmedBooking.vehicleDetails?.registrationNumber || confirmedBooking.walkInVehicle?.registrationNumber || "MH 12 AB 1234"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wash Package:</span>
                <span className="font-bold text-foreground">{confirmedBooking.serviceType} WASH</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setConfirmedBooking(null)
                  navigate(`${basePath}/queue`)
                }}
                className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all cursor-pointer"
              >
                Go to Queue Board
              </button>

              <button
                onClick={() => setConfirmedBooking(null)}
                className="px-5 py-3.5 rounded-xl bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-colors cursor-pointer border border-border"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
