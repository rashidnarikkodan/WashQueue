import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ShieldCheck,
  CheckCircle2,
  Camera,
  ArrowRight,
  FileText,
  Trash2,
  RotateCcw,
  Upload,
} from "lucide-react"
import { toast } from "sonner"
import { bookingApi } from "@/shared/apis/booking.api"
import type { BookingResponse } from "@/shared/apis/booking.api"
import { PhotoCaptureCamera } from "@/features/queue/components/ui/PhotoCaptureCamera"
import { readImageFileAsResizedDataUrl } from "@/shared/utils/imageFile"

interface PhotoSlotConfig {
  key: "front" | "rear" | "left" | "right"
  title: string
  subtitle: string
}

const PHOTO_SLOTS: PhotoSlotConfig[] = [
  { key: "front", title: "FRONT ANGLE", subtitle: "Front bumper & windshield" },
  { key: "rear", title: "REAR ANGLE", subtitle: "Rear bumper & trunk" },
  { key: "left", title: "LEFT SIDE", subtitle: "Driver side doors & wheels" },
  { key: "right", title: "RIGHT SIDE", subtitle: "Passenger side doors & wheels" },
]

export default function ManagerPreInspectionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [notes, setNotes] = useState("")
  const [capturedPhotos, setCapturedPhotos] = useState<Record<string, string>>({
    front: "",
    rear: "",
    left: "",
    right: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeCameraSlot, setActiveCameraSlot] = useState<string | null>(null)
  const [uploadTargetSlot, setUploadTargetSlot] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const fetchBooking = useCallback(async () => {
    if (!id) return
    try {
      const res = await bookingApi.getBookingById(id)
      setBooking(res)
      if (res.preServiceInspection?.photos && res.preServiceInspection.photos.length > 0) {
        const [f, r, l, rg] = res.preServiceInspection.photos
        setCapturedPhotos({
          front: f || "",
          rear: r || "",
          left: l || "",
          right: rg || "",
        })
      }
      if (res.preServiceInspection?.notes) {
        setNotes(res.preServiceInspection.notes)
      }
    } catch (err) {
      console.error("Failed to load booking for inspection:", err)
      toast.error("Failed to load booking details")
    }
  }, [id])

  useEffect(() => {
    let ignore = false
    void Promise.resolve().then(async () => {
      if (ignore) return
      await fetchBooking()
    })
    return () => {
      ignore = true
    }
  }, [fetchBooking])

  const triggerCamera = (slotKey: string) => {
    setActiveCameraSlot(slotKey)
  }

  const handlePhotoCaptured = (slotKey: string, dataUrl: string) => {
    setCapturedPhotos((prev) => ({
      ...prev,
      [slotKey]: dataUrl,
    }))
    setActiveCameraSlot(null)
    toast.success(`✓ ${slotKey.toUpperCase()} photo captured!`)
  }

  const handleRemovePhoto = (slotKey: string) => {
    setCapturedPhotos((prev) => ({
      ...prev,
      [slotKey]: "",
    }))
  }

  const triggerUpload = (slotKey: string) => {
    setUploadTargetSlot(slotKey)
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !uploadTargetSlot) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    try {
      const dataUrl = await readImageFileAsResizedDataUrl(file)
      handlePhotoCaptured(uploadTargetSlot, dataUrl)
    } catch (err) {
      console.error("Failed to read uploaded photo:", err)
      toast.error("Failed to read the selected photo")
    } finally {
      setUploadTargetSlot(null)
    }
  }

  const missingPhotoSlots = PHOTO_SLOTS.filter((slot) => !capturedPhotos[slot.key])
  const allPhotosCaptured = missingPhotoSlots.length === 0

  const handleSaveInspection = async () => {
    if (!booking) return
    if (!allPhotosCaptured) {
      toast.error(
        `Capture all 4 angle photos before checking in (missing: ${missingPhotoSlots
          .map((s) => s.title)
          .join(", ")})`
      )
      return
    }
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
      
      <div className="space-y-2 border-b border-border pb-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Customer Check-in & Pre-Inspection
        </h1>
        <p className="text-base text-muted-foreground font-medium max-w-2xl">
          Capture 4-angle vehicle condition photos on the spot before starting wash service.
        </p>
      </div>

      <div className="space-y-8">
        
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

          <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 flex items-center gap-4">
            <div className="h-11 w-11 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-500">Check-In Active</h3>
              <p className="text-xs text-emerald-500/80 font-medium">
                Ticket #{booking?.bookingNumber || "WQ-..."} verified for station queue.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
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
                onClick={() => toast.info("Viewing customer details")}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-colors border border-border cursor-pointer"
              >
                Verified Customer
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-muted/40 border border-border text-xs">
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  BOOKING ID
                </span>
                <span className="font-bold text-foreground text-sm">
                  {booking?.bookingNumber || "N/A"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  SERVICE TYPE
                </span>
                <span className="font-bold text-foreground text-sm">{booking?.serviceType || "FULL"} WASH</span>
              </div>

              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                  VEHICLE PLATE
                </span>
                <span className="font-bold text-primary text-sm font-mono">
                  {registrationNumber}
                </span>
              </div>
            </div>

          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-8 text-card-foreground shadow-md">
          
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <Camera className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Spot Photo Capture (4 Angles)</h2>
                <p className="text-xs text-muted-foreground">Tap any box to take a photo directly on the spot using camera.</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
              PHASE 02
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PHOTO_SLOTS.map((slot) => {
              const photoUrl = capturedPhotos[slot.key]
              return (
                <div key={slot.key} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span>{slot.title}</span>
                    {photoUrl && (
                      <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> CAPTURED
                      </span>
                    )}
                  </div>

                  <div
                    onClick={() => !photoUrl && triggerCamera(slot.key)}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all aspect-[4/3] flex flex-col items-center justify-center p-4 text-center ${
                      photoUrl
                        ? "border-emerald-500/50 bg-black shadow-md"
                        : "border-dashed border-border bg-muted/40 hover:border-primary hover:bg-muted/70 cursor-pointer"
                    }`}
                  >
                    {photoUrl ? (
                      <>
                        <img
                          src={photoUrl}
                          alt={slot.title}
                          className="w-full h-full object-cover rounded-xl"
                        />

                        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              triggerCamera(slot.key)
                            }}
                            className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md flex items-center gap-1.5 cursor-pointer border border-white/20"
                            title="Retake photo on spot"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Retake
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              triggerUpload(slot.key)
                            }}
                            className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md flex items-center gap-1.5 cursor-pointer border border-white/20"
                            title="Replace with an uploaded photo"
                          >
                            <Upload className="h-3.5 w-3.5" /> Upload
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemovePhoto(slot.key)
                            }}
                            className="p-2 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white font-bold text-xs backdrop-blur-md cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
                          <Camera className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground block uppercase">
                            TAKE {slot.key} PHOTO
                          </span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            {slot.subtitle}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            triggerUpload(slot.key)
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/70 text-foreground text-[10px] font-bold uppercase tracking-wide border border-border cursor-pointer"
                        >
                          <Upload className="h-3 w-3" /> Upload Instead
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-3">
            <span className="block text-xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> INSPECTION FINDINGS & NOTES
            </span>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes regarding existing scratches, dents, or customer instructions..."
              className="w-full p-4 rounded-2xl bg-muted text-foreground text-sm font-medium border border-border focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
            />
          </div>

          <div className="pt-2 flex flex-col items-end gap-2">
            {!allPhotosCaptured && (
              <p className="text-xs font-semibold text-amber-500">
                {missingPhotoSlots.length} angle photo{missingPhotoSlots.length > 1 ? "s" : ""} still needed:{" "}
                {missingPhotoSlots.map((s) => s.title).join(", ")}
              </p>
            )}
            <button
              onClick={handleSaveInspection}
              disabled={isSubmitting || !allPhotosCaptured}
              className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <span>{isSubmitting ? "Saving Inspection..." : "Save Inspection & Check-In Vehicle"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>

      {activeCameraSlot && (
        <PhotoCaptureCamera
          title={`Capture ${PHOTO_SLOTS.find((s) => s.key === activeCameraSlot)?.title || activeCameraSlot}`}
          subtitle={PHOTO_SLOTS.find((s) => s.key === activeCameraSlot)?.subtitle}
          onCapture={(dataUrl) => handlePhotoCaptured(activeCameraSlot, dataUrl)}
          onClose={() => setActiveCameraSlot(null)}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />

    </div>
  )
}
