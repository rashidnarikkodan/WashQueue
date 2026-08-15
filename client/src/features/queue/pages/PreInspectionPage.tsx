import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ShieldCheck,
  CheckCircle2,
  Camera,
  ArrowRight,
  FileText,
  Upload,
} from "lucide-react"
import { toast } from "sonner"
import { bookingApi } from "@/shared/apis/booking.api"
import type { BookingResponse } from "@/shared/apis/booking.api"

export default function ManagerPreInspectionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [notes, setNotes] = useState("")
  const [capturedPhotos, setCapturedPhotos] = useState<Record<string, string>>({
    front: "https://api.builder.io/api/v1/image/assets/TEMP/f269f08bc693f082ff57cdb031fb2aae3eca130c?width=609",
    rear: "https://api.builder.io/api/v1/image/assets/TEMP/9255820032f47f5963dae1b893acf2e6c1f6238d?width=609",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch Booking details
  const fetchBooking = useCallback(async () => {
    if (!id) return
    try {
      const res = await bookingApi.getBookingById(id)
      setBooking(res)
    } catch (err) {
      console.error("Failed to load booking for inspection:", err)
      toast.error("Failed to load booking details")
    }
  }, [id])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  // Mock Photo Capture
  const handleCapture = (slotKey: string) => {
    setCapturedPhotos((prev) => ({
      ...prev,
      [slotKey]: "https://api.builder.io/api/v1/image/assets/TEMP/f269f08bc693f082ff57cdb031fb2aae3eca130c?width=609",
    }))
    toast.success(`${slotKey.toUpperCase()} photo captured!`)
  }

  // Complete Pre-Service Inspection & Perform Atomic Check-In
  const handleSaveInspection = async () => {
    if (!booking) return
    setIsSubmitting(true)
    try {
      const photosArray = Object.values(capturedPhotos).filter(Boolean)
      await bookingApi.savePreInspection(booking.id, {
        photos: photosArray,
        notes: notes || "Pre-service inspection verified",
      })
      toast.success("Pre-service inspection saved & vehicle checked in to queue!")
      navigate("/manager/queues")
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      console.error("Inspection save error:", err)
      toast.error(errorObj?.message || "Failed to save pre-service inspection")
    } finally {
      setIsSubmitting(false)
    }
  }

  const customerName = booking?.customerDetails?.name || booking?.walkInCustomer?.name || (booking?.isWalkIn ? "Walk-In Customer" : "Customer")
  const phone = booking?.customerDetails?.phone || booking?.walkInCustomer?.phone || "N/A"
  const registrationNumber = booking?.vehicleDetails?.registrationNumber || booking?.walkInVehicle?.registrationNumber || "N/A"
  const initials = customerName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "CU"

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
      
      {/* Page Header */}
      <div className="space-y-2 border-b border-border pb-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Customer Check-in
        </h1>
        <p className="text-base text-muted-foreground font-medium max-w-2xl">
          Track and manage booking activity across all stations in the Sentinel network.
        </p>
      </div>

      {/* Main Inspection Layout */}
      <div className="space-y-8">
        
        {/* Phase 1: Check-In Verification Card */}
        <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-6 text-card-foreground shadow-md">
          
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Check-In Verification</h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
              PHASE 01
            </span>
          </div>

          {/* Success Banner */}
          <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 flex items-center gap-4">
            <div className="h-11 w-11 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-500">Check-In Successful</h3>
              <p className="text-xs text-emerald-500/80 font-medium">
                Ticket #{booking?.bookingNumber || "WQ-28472"} scanned at 10:03 AM by Auto-Gate 02
              </p>
            </div>
          </div>

          {/* Customer & Booking Details Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Customer Details Glass Card */}
            <div className="p-6 rounded-2xl border border-border bg-muted/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary font-black text-2xl flex items-center justify-center">
                  {initials}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    {customerName}
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </h3>
                  <p className="text-sm text-muted-foreground">{phone}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.info("Viewing customer profile")}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-colors border border-border cursor-pointer"
              >
                View Profile
              </button>
            </div>

            {/* Booking Details Grid */}
            <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-muted/40 border border-border text-xs">
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  BOOKING ID
                </span>
                <span className="font-bold text-foreground text-sm">
                  {booking?.bookingNumber || "WQ-28472"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  TIME WINDOW
                </span>
                <span className="font-bold text-foreground text-sm">10:00 AM - 11:00 AM</span>
              </div>

              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  VEHICLE TYPE
                </span>
                <span className="font-bold text-primary text-sm">
                  {booking?.vehicleDetails?.model || "SEDAN"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  WASH TYPE
                </span>
                <span className="font-bold text-foreground">
                  {booking?.serviceType || "FULL"} WASH
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  EXTRA SERVICES
                </span>
                <span className="font-bold text-foreground">TYRE POLISH</span>
              </div>

              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  PAYMENT STATUS
                </span>
                <span className="font-bold text-emerald-500 uppercase">
                  {booking?.paymentStatus || "PAID"}
                </span>
              </div>
            </div>

          </div>

          {/* Vehicle Snapshot & Assistance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            
            <div className="p-6 rounded-2xl bg-muted/40 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-card text-foreground font-mono font-black text-sm tracking-widest border border-border">
                  {registrationNumber}
                </span>
                <span className="text-xs text-muted-foreground font-medium">Registered 2021</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {booking?.vehicleDetails?.brand || "Silver"} {booking?.vehicleDetails?.model || "BMW 3 Series"}
              </h3>
            </div>

            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
              <h4 className="text-sm font-bold text-primary">Need Assistance?</h4>
              <p className="text-xs text-muted-foreground">
                If customer profile doesn't match the vehicle, trigger a Manager Override.
              </p>
              <button
                type="button"
                onClick={() => toast.info("Admin assistance requested")}
                className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-primary font-bold text-xs transition-colors border border-border cursor-pointer"
              >
                Request Admin Assistance
              </button>
            </div>

          </div>

        </div>

        {/* Phase 2: Pre-Service Inspection Card */}
        <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-8 text-card-foreground shadow-md">
          
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <Camera className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Pre-Service Inspection</h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
              PHASE 02
            </span>
          </div>

          {/* Photo Capture Grid (4 Slots) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Front Photo */}
            <div className="relative rounded-2xl overflow-hidden border border-border bg-muted group aspect-[16/10] flex items-center justify-center">
              {capturedPhotos.front ? (
                <>
                  <img src={capturedPhotos.front} alt="Front" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-full">
                    FRONT CAPTURED
                  </div>
                </>
              ) : (
                <button onClick={() => handleCapture("front")} className="text-center space-y-2 cursor-pointer">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
                  <span className="text-xs font-bold text-muted-foreground block uppercase">FRONT SIDE</span>
                </button>
              )}
            </div>

            {/* Rear Photo */}
            <div className="relative rounded-2xl overflow-hidden border border-border bg-muted group aspect-[16/10] flex items-center justify-center">
              {capturedPhotos.rear ? (
                <>
                  <img src={capturedPhotos.rear} alt="Rear" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-full">
                    REAR CAPTURED
                  </div>
                </>
              ) : (
                <button onClick={() => handleCapture("rear")} className="text-center space-y-2 cursor-pointer">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
                  <span className="text-xs font-bold text-muted-foreground block uppercase">REAR SIDE</span>
                </button>
              )}
            </div>

            {/* Left Side Photo */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-border bg-muted/40 hover:border-primary transition-colors group aspect-[16/10] flex items-center justify-center">
              {capturedPhotos.left ? (
                <img src={capturedPhotos.left} alt="Left" className="w-full h-full object-cover" />
              ) : (
                <button onClick={() => handleCapture("left")} className="text-center space-y-2 cursor-pointer">
                  <Camera className="h-6 w-6 text-muted-foreground mx-auto" />
                  <span className="text-xs font-bold text-foreground block uppercase">LEFT SIDE</span>
                  <span className="text-[10px] text-muted-foreground block">Pending Capture</span>
                </button>
              )}
            </div>

            {/* Right Side Photo */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-border bg-muted/40 hover:border-primary transition-colors group aspect-[16/10] flex items-center justify-center">
              {capturedPhotos.right ? (
                <img src={capturedPhotos.right} alt="Right" className="w-full h-full object-cover" />
              ) : (
                <button onClick={() => handleCapture("right")} className="text-center space-y-2 cursor-pointer">
                  <Camera className="h-6 w-6 text-muted-foreground mx-auto" />
                  <span className="text-xs font-bold text-foreground block uppercase">RIGHT SIDE</span>
                  <span className="text-[10px] text-muted-foreground block">Pending Capture</span>
                </button>
              )}
            </div>

          </div>

          {/* Internal Notes Textarea */}
          <div className="space-y-3">
            <span className="block text-xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> INTERNAL NOTES
            </span>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes and inspection findings regarding scratches, pre-existing dents, or special requests..."
              className="w-full p-4 rounded-2xl bg-muted text-foreground text-sm font-medium border border-border focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveInspection}
              disabled={isSubmitting}
              className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <span>{isSubmitting ? "Saving..." : "Save & Complete Inspection"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}
