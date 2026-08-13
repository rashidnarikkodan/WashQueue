import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  CheckCircle2,
  Camera,
  Check,
  Plus,
  ArrowRight,
} from "lucide-react"
import { toast } from "sonner"
import { bookingApi } from "@/shared/apis/booking.api"
import type { BookingResponse } from "@/shared/apis/booking.api"

export default function ManagerPostInspectionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<BookingResponse | null>(null)
  
  // Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    paintGloss: true,
    wheels: true,
    glass: true,
    dashboard: true,
    seats: true,
    specialRequest: true,
  })
  
  const [remarks, setRemarks] = useState<Record<string, string>>({})
  const [handoverNotes, setHandoverNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch Booking Details
  const fetchBooking = useCallback(async () => {
    if (!id) return
    try {
      const res = await bookingApi.getBookingById(id)
      setBooking(res)
    } catch (err) {
      console.error("Failed to fetch booking:", err)
      toast.error("Failed to load booking details")
    }
  }, [id])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  // Toggle Checklist item
  const toggleChecklistItem = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Handle Add Remark
  const handleAddRemark = (key: string) => {
    const remark = prompt(`Enter remark for ${key}:`)
    if (remark) {
      setRemarks((prev) => ({ ...prev, [key]: remark }))
      toast.success("Remark saved")
    }
  }

  // Finalize Handover to Customer
  const handleHandover = async () => {
    if (!booking) return
    setIsSubmitting(true)
    try {
      await bookingApi.advanceStatus(booking.id, "COMPLETED")
      toast.success("Vehicle handover completed & booking closed!")
      navigate("/manager/queues")
    } catch (err: any) {
      console.error("Handover error:", err)
      toast.error(err?.message || "Failed to complete handover")
    } finally {
      setIsSubmitting(false)
    }
  }

  const bookingIdStr = booking?.bookingNumber || "WQ-8820"
  const customerName = booking?.customerDetails?.name || booking?.walkInCustomer?.name || "Rashid N."
  const vehicleName = booking?.vehicleDetails?.brand
    ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model || ""}`
    : "Honda City"
  const plate = booking?.vehicleDetails?.registrationNumber || booking?.walkInVehicle?.registrationNumber || "MH 01 AB 1234"

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Post Service Inspection
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Review quality standards and finalize handover for vehicle #{bookingIdStr}
          </p>
        </div>

        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          SERVICE COMPLETED
        </span>
      </div>

      {/* 2. Bento Grid Layout (70% - 30% split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (70% width / 7 Cols): Details & Inspection Checklist */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Booking Summary Card */}
          <div className="rounded-3xl bg-card border border-border p-6 space-y-6 text-card-foreground shadow-md">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                  BOOKING ID
                </span>
                <h2 className="text-2xl font-bold text-foreground">#{bookingIdStr}</h2>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  CUSTOMER
                </span>
                <h3 className="text-lg font-bold text-foreground">{customerName}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">VEHICLE</span>
                <p className="font-bold text-foreground text-sm">{vehicleName}</p>
                <p className="text-muted-foreground text-[11px]">{plate}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">WASH TYPE</span>
                <p className="font-bold text-foreground text-sm">{booking?.serviceType || "Full"} Wash</p>
                <p className="text-muted-foreground text-[11px]">Exterior + Interior</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">STARTED</span>
                <p className="font-bold text-foreground text-sm">10:02 AM</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">DURATION</span>
                <p className="font-bold text-foreground text-sm">43 Mins</p>
              </div>
            </div>
          </div>

          {/* Inspection Checklist Card */}
          <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-6 text-card-foreground shadow-md">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Inspection Checklist</h2>
            </div>

            {/* EXTERIOR INTEGRITY */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                EXTERIOR INTEGRITY
              </span>

              <div className="space-y-2">
                {[
                  { key: "paintGloss", label: "Bodywork & Paint Gloss" },
                  { key: "wheels", label: "Wheels & Rim Cleaning" },
                  { key: "glass", label: "Glass & Mirrored Surfaces" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-4 rounded-xl bg-muted border border-border flex items-center justify-between"
                  >
                    <div
                      onClick={() => toggleChecklistItem(item.key)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div
                        className={`h-5 w-5 rounded border flex items-center justify-center ${
                          checklist[item.key]
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-muted"
                        }`}
                      >
                        {checklist[item.key] && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{item.label}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddRemark(item.label)}
                      className="text-xs font-bold text-primary hover:underline transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      {remarks[item.label] ? "Edit Remark" : "Add Remark"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* INTERIOR SANITIZATION */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                INTERIOR SANITIZATION
              </span>

              <div className="space-y-2">
                {[
                  { key: "dashboard", label: "Dashboard & Console Dusting" },
                  { key: "seats", label: "Seats & Upholstery Check" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-4 rounded-xl bg-muted border border-border flex items-center justify-between"
                  >
                    <div
                      onClick={() => toggleChecklistItem(item.key)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div
                        className={`h-5 w-5 rounded border flex items-center justify-center ${
                          checklist[item.key]
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-muted"
                        }`}
                      >
                        {checklist[item.key] && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{item.label}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddRemark(item.label)}
                      className="text-xs font-bold text-primary hover:underline transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      {remarks[item.label] ? "Edit Remark" : "Add Remark"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* FINAL QUALITY VERIFICATION */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                FINAL QUALITY VERIFICATION
              </span>

              <div className="p-4 rounded-xl bg-muted border border-border flex items-center justify-between">
                <div
                  onClick={() => toggleChecklistItem("specialRequest")}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div
                    className={`h-5 w-5 rounded border flex items-center justify-center ${
                      checklist.specialRequest
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border bg-muted"
                    }`}
                  >
                    {checklist.specialRequest && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-sm font-semibold text-foreground">Special Request Fulfillment</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddRemark("Special Request Fulfillment")}
                  className="text-xs font-bold text-primary hover:underline transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Add Remark
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (30% width / 5 Cols): Evidence & Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Photo Evidence Hub Card */}
          <div className="rounded-3xl bg-card border border-border p-6 space-y-4 text-card-foreground shadow-md">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Photo Evidence</h3>
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                4 / 5 COMPLETE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "RETAKE FRONT", img: "https://api.builder.io/api/v1/image/assets/TEMP/bcc46719a4f9037c08ace4050a896720a33a7a28?width=635" },
                { title: "RETAKE REAR", img: "https://api.builder.io/api/v1/image/assets/TEMP/a7601f720acbfe8f0cac773fb1d501c72cb1d0fc?width=635" },
                { title: "RETAKE LEFT", img: "https://api.builder.io/api/v1/image/assets/TEMP/93b31d3821af229e7a649b2f6ecf696ebfc80ae9?width=635" },
              ].map((p, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-video border border-border group">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                    <span className="px-2.5 py-1 rounded-full bg-primary/20 text-white font-bold text-[10px] uppercase border border-white/20">
                      {p.title}
                    </span>
                  </div>
                </div>
              ))}

              <div className="rounded-xl border-2 border-dashed border-border bg-muted p-4 flex flex-col items-center justify-center text-center space-y-1">
                <Plus className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-bold text-foreground uppercase">RIGHT PROFILE</span>
                <div className="w-full bg-border h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-primary h-full w-3/4" />
                </div>
              </div>
            </div>
          </div>

          {/* Handover Readiness Card */}
          <div className="rounded-3xl bg-card border border-border p-6 space-y-6 text-card-foreground shadow-md">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
              Readiness Check
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 text-emerald-500 font-semibold">
                <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <span>All Checklist Items Verified</span>
              </div>

              <div className="flex items-center gap-3 text-foreground">
                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <span>Mandatory Photos Uploaded</span>
              </div>

              <div className="flex items-center gap-3 text-foreground">
                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <span>Manager's Signature/Notes Provided</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                MANAGER'S FINAL OBSERVATIONS
              </label>
              <textarea
                rows={3}
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                placeholder="Add handover notes or customer feedback..."
                className="w-full p-3 rounded-xl bg-muted text-foreground text-xs font-medium border border-border focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => toast.success("Post-inspection saved")}
                className="px-5 py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border font-extrabold text-xs transition-colors cursor-pointer"
              >
                Save
              </button>

              <button
                type="button"
                onClick={handleHandover}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{isSubmitting ? "Completing..." : "Handover to customer"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
