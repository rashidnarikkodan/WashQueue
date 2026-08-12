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

  // Complete Inspection
  const handleSaveInspection = async () => {
    if (!booking) return
    setIsSubmitting(true)
    try {
      await bookingApi.advanceStatus(booking.id, "IN_SERVICE")
      toast.success("Pre-service inspection saved & wash service started!")
      navigate("/manager/queues")
    } catch (err: any) {
      console.error("Inspection save error:", err)
      toast.error(err?.message || "Failed to save inspection")
    } finally {
      setIsSubmitting(false)
    }
  }

  const customerName = booking?.customerDetails?.name || booking?.walkInCustomer?.name || "Rashid Narikkodan"
  const phone = booking?.customerDetails?.phone || booking?.walkInCustomer?.phone || "+91 98450 •••• 12"
  const registrationNumber = booking?.vehicleDetails?.registrationNumber || booking?.walkInVehicle?.registrationNumber || "KA 01 MR 7829"

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 sm:p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
      
      {/* Page Header */}
      <div className="space-y-2 border-b border-slate-800/80 pb-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-100 tracking-tight">
          Customer Check-in
        </h1>
        <p className="text-base text-slate-400 font-medium max-w-2xl">
          Track and manage booking activity across all stations in the Sentinel network.
        </p>
      </div>

      {/* Main Inspection Layout */}
      <div className="space-y-8">
        
        {/* Phase 1: Check-In Verification Card */}
        <div className="rounded-3xl bg-[#151B2D] border border-white/5 p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white tracking-tight">Check-In Verification</h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
              PHASE 01
            </span>
          </div>

          {/* Success Banner */}
          <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 flex items-center gap-4">
            <div className="h-11 w-11 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-400">Check-In Successful</h3>
              <p className="text-xs text-emerald-400/80 font-medium">
                Ticket #{booking?.bookingNumber || "WQ-28472"} scanned at 10:03 AM by Auto-Gate 02
              </p>
            </div>
          </div>

          {/* Customer & Booking Details Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Customer Details Glass Card */}
            <div className="p-6 rounded-2xl border border-white/5 bg-[#2E3447]/60 backdrop-blur-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-blue-500/20 text-blue-400 font-black text-2xl flex items-center justify-center">
                  RN
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {customerName}
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                  </h3>
                  <p className="text-sm text-slate-400">{phone}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.info("Viewing customer profile")}
                className="px-4 py-2 rounded-xl bg-[#2E3447] hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                View Profile
              </button>
            </div>

            {/* Booking Details Grid */}
            <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  BOOKING ID
                </span>
                <span className="font-bold text-white text-sm">
                  {booking?.bookingNumber || "WQ-28472"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  TIME WINDOW
                </span>
                <span className="font-bold text-white text-sm">10:00 AM - 11:00 AM</span>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  VEHICLE TYPE
                </span>
                <span className="font-bold text-blue-300 text-sm">
                  {booking?.vehicleDetails?.model || "SEDAN"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  WASH TYPE
                </span>
                <span className="font-bold text-slate-300">
                  {booking?.serviceType || "FULL"} WASH
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  EXTRA SERVICES
                </span>
                <span className="font-bold text-slate-300">TYRE POLISH</span>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  PAYMENT STATUS
                </span>
                <span className="font-bold text-emerald-400 uppercase">
                  {booking?.paymentStatus || "PAID"}
                </span>
              </div>
            </div>

          </div>

          {/* Vehicle Snapshot & Assistance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-white text-slate-950 font-mono font-black text-sm tracking-widest">
                  {registrationNumber}
                </span>
                <span className="text-xs text-slate-400 font-medium">Registered 2021</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {booking?.vehicleDetails?.brand || "Silver"} {booking?.vehicleDetails?.model || "BMW 3 Series"}
              </h3>
            </div>

            <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
              <h4 className="text-sm font-bold text-blue-400">Need Assistance?</h4>
              <p className="text-xs text-slate-400">
                If customer profile doesn't match the vehicle, trigger a Manager Override.
              </p>
              <button
                type="button"
                onClick={() => toast.info("Admin assistance requested")}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Request Admin Assistance
              </button>
            </div>

          </div>

        </div>

        {/* Phase 2: Pre-Service Inspection Card */}
        <div className="rounded-3xl bg-[#151B2D] border border-white/5 p-6 sm:p-8 space-y-8 shadow-2xl">
          
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <Camera className="h-6 w-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white tracking-tight">Pre-Service Inspection</h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
              PHASE 02
            </span>
          </div>

          {/* Photo Capture Grid (4 Slots) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Front Photo */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#191F31] group aspect-[16/10] flex items-center justify-center">
              {capturedPhotos.front ? (
                <>
                  <img src={capturedPhotos.front} alt="Front" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-full">
                    FRONT CAPTURED
                  </div>
                </>
              ) : (
                <button onClick={() => handleCapture("front")} className="text-center space-y-2 cursor-pointer">
                  <Upload className="h-6 w-6 text-slate-500 mx-auto" />
                  <span className="text-xs font-bold text-slate-400 block uppercase">FRONT SIDE</span>
                </button>
              )}
            </div>

            {/* Rear Photo */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#191F31] group aspect-[16/10] flex items-center justify-center">
              {capturedPhotos.rear ? (
                <>
                  <img src={capturedPhotos.rear} alt="Rear" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-full">
                    REAR CAPTURED
                  </div>
                </>
              ) : (
                <button onClick={() => handleCapture("rear")} className="text-center space-y-2 cursor-pointer">
                  <Upload className="h-6 w-6 text-slate-500 mx-auto" />
                  <span className="text-xs font-bold text-slate-400 block uppercase">REAR SIDE</span>
                </button>
              )}
            </div>

            {/* Left Side Photo */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-700/60 bg-[#2E3447]/40 hover:border-blue-400 transition-colors group aspect-[16/10] flex items-center justify-center">
              {capturedPhotos.left ? (
                <img src={capturedPhotos.left} alt="Left" className="w-full h-full object-cover" />
              ) : (
                <button onClick={() => handleCapture("left")} className="text-center space-y-2 cursor-pointer">
                  <Camera className="h-6 w-6 text-slate-400 mx-auto" />
                  <span className="text-xs font-bold text-slate-300 block uppercase">LEFT SIDE</span>
                  <span className="text-[10px] text-slate-500 block">Pending Capture</span>
                </button>
              )}
            </div>

            {/* Right Side Photo */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-700/60 bg-[#2E3447]/40 hover:border-blue-400 transition-colors group aspect-[16/10] flex items-center justify-center">
              {capturedPhotos.right ? (
                <img src={capturedPhotos.right} alt="Right" className="w-full h-full object-cover" />
              ) : (
                <button onClick={() => handleCapture("right")} className="text-center space-y-2 cursor-pointer">
                  <Camera className="h-6 w-6 text-slate-400 mx-auto" />
                  <span className="text-xs font-bold text-slate-300 block uppercase">RIGHT SIDE</span>
                  <span className="text-[10px] text-slate-500 block">Pending Capture</span>
                </button>
              )}
            </div>

          </div>

          {/* Internal Notes Textarea */}
          <div className="space-y-3">
            <span className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" /> INTERNAL NOTES
            </span>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes and inspection findings regarding scratches, pre-existing dents, or special requests..."
              className="w-full p-4 rounded-2xl bg-[#2E3447] text-white text-sm font-medium border border-slate-700 focus:outline-none focus:border-blue-400 transition-colors placeholder:text-slate-500"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveInspection}
              disabled={isSubmitting}
              className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2"
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
