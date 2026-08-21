import { useState, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { toPng } from "html-to-image"
import {
  Copy,
  Check,
  Download,
  Car,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Navigation,
  QrCode,
} from "lucide-react"
import { toast } from "sonner"

interface QRCodePassProps {
  value: string
  bookingNumber: string
  stationName?: string
  stationCity?: string
  vehicleName?: string
  plateNumber?: string
  serviceName?: string
  scheduledDate?: string
  scheduledTime?: string
  totalPrice?: number
  paymentStatus?: string
  title?: string
  subtitle?: string
}

export default function QRCodePass({
  value,
  bookingNumber,
  stationName = "Service Station",
  stationCity = "",
  vehicleName = "Vehicle",
  plateNumber,
  serviceName = "Car Wash Service",
  scheduledDate,
  scheduledTime,
  totalPrice,
  paymentStatus = "PAID",
  title = "CHECK-IN ADMIT PASS",
  subtitle = "Show this QR code at the station entrance for automated check-in scanning.",
}: QRCodePassProps) {
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const passRef = useRef<HTMLDivElement>(null)

  const handleCopyBookingNumber = async () => {
    try {
      await navigator.clipboard.writeText(bookingNumber)
      setCopied(true)
      toast.success("Pass code copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy pass code")
    }
  }

  const handleDownloadImage = async () => {
    if (!passRef.current) {
      toast.error("Pass element not found")
      return
    }

    setIsDownloading(true)
    try {
      const dataUrl = await toPng(passRef.current, { cacheBust: true, pixelRatio: 2 })
      const link = document.createElement("a")
      link.download = `WashQueue-Pass-${bookingNumber}.png`
      link.href = dataUrl
      link.click()
      toast.success("Ticket pass saved to downloads!")
    } catch (err) {
      console.error("Failed to download ticket pass image:", err)
      toast.error("Failed to download ticket pass image")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleGetDirections = () => {
    window.open(
      `https://maps.google.com/?q=${encodeURIComponent(stationName + " " + stationCity)}`,
      "_blank"
    )
  }

  return (
    <div className="w-full space-y-3">
      {/* Ticket Pass Main Container */}
      <div
        ref={passRef}
        className="w-full rounded-3xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden text-left select-none"
      >
        {/* Header Bar */}
        <div className="bg-primary p-4 text-primary-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-foreground/20 flex items-center justify-center text-primary-foreground font-bold">
              <QrCode size={16} />
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-primary-foreground/80">
                WASHQUEUE PASS
              </div>
              <h4 className="text-xs font-extrabold text-primary-foreground tracking-tight">{title}</h4>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/30">
            ✓ {paymentStatus}
          </span>
        </div>

        {/* Ticket Details Grid */}
        <div className="p-4 sm:p-5 space-y-3 bg-card">
          {/* Station & Vehicle Row */}
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border">
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">
                STATION
              </span>
              <div className="font-bold text-foreground text-xs sm:text-sm truncate">
                {stationName}
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin size={11} className="text-primary shrink-0" />
                <span className="truncate">{stationCity}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">
                VEHICLE
              </span>
              <div className="font-bold text-foreground text-xs sm:text-sm truncate flex items-center gap-1.5">
                <Car size={13} className="text-primary shrink-0" />
                <span className="truncate">{vehicleName}</span>
              </div>
              {plateNumber && (
                <span className="inline-block px-2 py-0.5 rounded bg-muted text-[10px] font-mono font-bold text-primary">
                  {plateNumber}
                </span>
              )}
            </div>
          </div>

          {/* Service & Schedule Row */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">
                SERVICE
              </span>
              <div className="font-bold text-foreground text-xs truncate flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-primary shrink-0" />
                <span className="truncate">{serviceName}</span>
              </div>
              {totalPrice !== undefined && (
                <p className="text-[11px] text-muted-foreground font-medium">
                  Paid:{" "}
                  <strong className="text-foreground">₹{totalPrice.toLocaleString("en-IN")}</strong>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">
                SLOT TIME
              </span>
              {scheduledTime && (
                <p className="font-bold text-foreground text-xs flex items-center gap-1">
                  <Clock size={11} className="text-primary shrink-0" />
                  <span className="truncate">{scheduledTime}</span>
                </p>
              )}
              {scheduledDate && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Calendar size={11} className="text-muted-foreground/70 shrink-0" />
                  <span className="truncate">{scheduledDate}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sleek Dashed Perforated Line */}
        <div className="w-full border-t border-dashed border-border px-4 my-1" />

        {/* QR Code Entry Stub */}
        <div className="p-4 sm:p-5 bg-muted/40 text-center space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-[9px]">ENTRY QR PASS</span>
            <span className="font-mono text-[10px] text-primary font-bold">#{bookingNumber}</span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-border inline-block shadow-md mx-auto">
            <QRCodeSVG
              id={`qr-code-${bookingNumber}`}
              value={value}
              size={145}
              level="H"
              includeMargin={true}
              fgColor="#070b14"
              bgColor="#ffffff"
            />
            <div className="text-[10px] font-mono font-black tracking-widest text-slate-950 pt-1">
              {bookingNumber}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-snug max-w-[280px] mx-auto">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="py-3 px-4 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            <Download size={14} />
            <span>{isDownloading ? "Saving..." : "Download Pass"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyBookingNumber}
            className="py-3 px-4 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleGetDirections}
          className="w-full py-2.5 px-4 rounded-xl bg-muted/60 hover:bg-muted border border-border text-foreground font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <Navigation size={14} className="text-primary" />
          <span>Get Directions to Station</span>
        </button>
      </div>
    </div>
  )
}
