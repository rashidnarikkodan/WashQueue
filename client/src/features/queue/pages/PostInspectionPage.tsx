import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  CheckCircle2,
  Camera,
  Check,
  Upload,
} from "lucide-react"
import { toast } from "sonner"
import { bookingApi } from "@/shared/apis/booking.api"
import type { BookingResponse, InspectionChecklistItem } from "@/shared/apis/booking.api"
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

interface ChecklistItemConfig {
  key: string
  label: string
  group: string
}

// Order matters: rendered top-to-bottom grouped by `group`. Keys here must match
// REQUIRED_CHECKLIST_KEYS in the server's save-post-inspection use case.
const CHECKLIST_ITEMS: ChecklistItemConfig[] = [
  { key: "paintGloss", label: "Bodywork & Paint Gloss", group: "EXTERIOR INTEGRITY" },
  { key: "wheels", label: "Wheels & Rim Cleaning", group: "EXTERIOR INTEGRITY" },
  { key: "glass", label: "Glass & Mirrored Surfaces", group: "EXTERIOR INTEGRITY" },
  { key: "dashboard", label: "Dashboard & Console Dusting", group: "INTERIOR SANITIZATION" },
  { key: "seats", label: "Seats & Upholstery Check", group: "INTERIOR SANITIZATION" },
  { key: "specialRequest", label: "Special Request Fulfillment", group: "FINAL QUALITY VERIFICATION" },
]

const CHECKLIST_GROUPS = Array.from(new Set(CHECKLIST_ITEMS.map((item) => item.group)))

export default function ManagerPostInspectionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<BookingResponse | null>(null)
  
  // Photo Evidence State for 4 angles
  const [capturedPhotos, setCapturedPhotos] = useState<Record<string, string>>({
    front: "",
    rear: "",
    left: "",
    right: "",
  })
  const [activeCameraSlot, setActiveCameraSlot] = useState<string | null>(null)
  const [uploadTargetSlot, setUploadTargetSlot] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
      if (res.postServiceInspection?.photos && res.postServiceInspection.photos.length > 0) {
        const [f, r, l, rg] = res.postServiceInspection.photos
        setCapturedPhotos({
          front: f || "",
          rear: r || "",
          left: l || "",
          right: rg || "",
        })
      }
    } catch (err) {
      console.error("Failed to fetch booking:", err)
      toast.error("Failed to load booking details")
    }
  }, [id])

  // Open the in-app live camera for a given slot
  const triggerCamera = (slotKey: string) => {
    setActiveCameraSlot(slotKey)
  }

  // Handle a photo captured on the spot from PhotoCaptureCamera
  const handlePhotoCaptured = (slotKey: string, dataUrl: string) => {
    setCapturedPhotos((prev) => ({
      ...prev,
      [slotKey]: dataUrl,
    }))
    setActiveCameraSlot(null)
    toast.success(`✓ ${slotKey.toUpperCase()} photo captured!`)
  }

  // Remove Photo from Slot
  const handleRemovePhoto = (slotKey: string) => {
    setCapturedPhotos((prev) => ({
      ...prev,
      [slotKey]: "",
    }))
  }

  // Open the OS file/gallery picker for a given slot
  const triggerUpload = (slotKey: string) => {
    setUploadTargetSlot(slotKey)
    fileInputRef.current?.click()
  }

  // Handle a photo chosen manually from device storage/gallery
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

  // Toggle Checklist item
  const toggleChecklistItem = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Handle Add Remark (keyed by the item's short key, not its display label)
  const handleAddRemark = (itemKey: string, itemLabel: string) => {
    const remark = prompt(`Enter remark for ${itemLabel}:`, remarks[itemKey] || "")
    if (remark !== null) {
      setRemarks((prev) => ({ ...prev, [itemKey]: remark }))
      if (remark.trim()) toast.success("Remark saved")
    }
  }

  const missingPhotoSlots = PHOTO_SLOTS.filter((slot) => !capturedPhotos[slot.key])
  const allPhotosCaptured = missingPhotoSlots.length === 0

  // A failed (unchecked) checklist item must have a remark explaining the issue before
  // the inspection can be completed — mirrors the server's own validation.
  const failedItemsMissingRemark = CHECKLIST_ITEMS.filter(
    (item) => !checklist[item.key] && !remarks[item.key]?.trim()
  )
  const allChecklistReviewed = failedItemsMissingRemark.length === 0

  // Single-Step Complete Inspection & Customer Handover
  const handleCompleteInspectionAndHandover = async () => {
    if (!booking) return
    if (!allPhotosCaptured) {
      toast.error(
        `Capture all 4 angle photos before completing inspection (missing: ${missingPhotoSlots
          .map((s) => s.title)
          .join(", ")})`
      )
      return
    }
    if (!allChecklistReviewed) {
      toast.error(
        `Add a remark explaining the issue for: ${failedItemsMissingRemark
          .map((i) => i.label)
          .join(", ")}`
      )
      return
    }
    setIsSubmitting(true)
    try {
      const photosArray = Object.values(capturedPhotos).filter(Boolean)
      const checklistPayload: InspectionChecklistItem[] = CHECKLIST_ITEMS.map((item) => ({
        key: item.key,
        label: item.label,
        passed: Boolean(checklist[item.key]),
        remark: remarks[item.key]?.trim() || undefined,
      }))
      await bookingApi.savePostInspection(booking.id, {
        photos: photosArray,
        notes: handoverNotes || "Post-service vehicle quality inspection verified & handed over to customer",
        checklist: checklistPayload,
      })
      toast.success("✓ Inspection verified & vehicle handover completed!")
      navigate("/manager/queues")
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      console.error("Post inspection error:", err)
      toast.error(errorObj?.message || "Failed to complete post-service inspection and handover")
    } finally {
      setIsSubmitting(false)
    }
  }

  const bookingIdStr = booking?.bookingNumber || ""
  const customerName = booking?.customerDetails?.name || booking?.walkInCustomer?.name || (booking?.isWalkIn ? "Walk-In Customer" : "Customer")
  const vehicleName = booking?.vehicleDetails?.brand
    ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model || ""}`.trim()
    : "Vehicle"
  const plate = booking?.vehicleDetails?.registrationNumber || booking?.walkInVehicle?.registrationNumber || "N/A"

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

            {CHECKLIST_GROUPS.map((group) => (
              <div key={group} className="space-y-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {group}
                </span>

                <div className="space-y-2">
                  {CHECKLIST_ITEMS.filter((item) => item.group === group).map((item) => (
                    <div
                      key={item.key}
                      className="p-4 rounded-xl bg-muted border border-border space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div
                          onClick={() => toggleChecklistItem(item.key)}
                          className="flex items-center gap-3 cursor-pointer min-w-0"
                        >
                          <div
                            className={`h-5 w-5 shrink-0 rounded border flex items-center justify-center ${
                              checklist[item.key]
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-destructive bg-destructive/10"
                            }`}
                          >
                            {checklist[item.key] && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-sm font-semibold text-foreground truncate">
                            {item.label}
                          </span>
                          {!checklist[item.key] && (
                            <span className="shrink-0 text-[9px] font-black uppercase text-destructive bg-destructive/10 border border-destructive/20 px-1.5 py-0.5 rounded">
                              Issue Flagged
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddRemark(item.key, item.label)}
                          className="shrink-0 text-xs font-bold text-primary hover:underline transition-colors uppercase tracking-wider cursor-pointer"
                        >
                          {remarks[item.key] ? "Edit Remark" : "Add Remark"}
                        </button>
                      </div>
                      {remarks[item.key] && (
                        <p className="text-xs text-muted-foreground italic pl-8">
                          &ldquo;{remarks[item.key]}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

          </div>

        </div>

        {/* Right Column (30% width / 5 Cols): Evidence & Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Photo Evidence Hub Card (4 Spot Camera Boxes) */}
          <div className="rounded-3xl bg-card border border-border p-6 space-y-4 text-card-foreground shadow-md">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Post-Service Photos (4 Angles)</h3>
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {Object.values(capturedPhotos).filter(Boolean).length} / 4 CAPTURED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PHOTO_SLOTS.map((slot) => {
                const photoUrl = capturedPhotos[slot.key]
                return (
                  <div key={slot.key} className="space-y-1">
                    <div
                      onClick={() => !photoUrl && triggerCamera(slot.key)}
                      className={`relative rounded-xl overflow-hidden aspect-video border transition-all flex flex-col items-center justify-center p-2 text-center ${
                        photoUrl
                          ? "border-emerald-500/40 bg-black"
                          : "border-dashed border-border bg-muted/40 hover:border-primary hover:bg-muted/70 cursor-pointer"
                      }`}
                    >
                      {photoUrl ? (
                        <>
                          <img src={photoUrl} alt={slot.title} className="w-full h-full object-cover rounded-lg" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                triggerCamera(slot.key)
                              }}
                              className="px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-white font-bold text-[10px] backdrop-blur-md cursor-pointer"
                            >
                              Retake
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                triggerUpload(slot.key)
                              }}
                              className="p-1 rounded bg-white/20 hover:bg-white/30 text-white text-[10px] backdrop-blur-md cursor-pointer"
                              title="Replace with an uploaded photo"
                            >
                              <Upload className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemovePhoto(slot.key)
                              }}
                              className="p-1 rounded bg-rose-500/80 hover:bg-rose-600 text-white text-[10px] backdrop-blur-md cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1">
                          <Camera className="h-4 w-4 text-primary mx-auto" />
                          <span className="text-[10px] font-bold text-foreground block uppercase">{slot.key} PHOTO</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              triggerUpload(slot.key)
                            }}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted hover:bg-muted/70 text-foreground text-[9px] font-bold uppercase border border-border cursor-pointer"
                          >
                            <Upload className="h-2.5 w-2.5" /> Upload
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Handover Readiness Card */}
          <div className="rounded-3xl bg-card border border-border p-6 space-y-6 text-card-foreground shadow-md">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
              Readiness Check
            </h3>

            <div className="space-y-3 text-xs">
              <div
                className={`flex items-center gap-3 font-semibold ${allChecklistReviewed ? "text-success" : "text-destructive"}`}
              >
                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center ${allChecklistReviewed ? "bg-success/20" : "bg-destructive/20"}`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <span>
                  {allChecklistReviewed
                    ? "All Checklist Items Verified"
                    : `${failedItemsMissingRemark.length} Flagged Item${failedItemsMissingRemark.length > 1 ? "s" : ""} Need Remarks`}
                </span>
              </div>

              <div
                className={`flex items-center gap-3 font-semibold ${allPhotosCaptured ? "text-success" : "text-foreground"}`}
              >
                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center border ${allPhotosCaptured ? "bg-success/20 border-transparent" : "bg-muted text-muted-foreground border-border"}`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <span>Mandatory Photos Uploaded</span>
              </div>

              <div
                className={`flex items-center gap-3 font-semibold ${handoverNotes.trim() ? "text-success" : "text-foreground"}`}
              >
                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center border ${handoverNotes.trim() ? "bg-success/20 border-transparent" : "bg-muted text-muted-foreground border-border"}`}
                >
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

            <div className="flex flex-col items-stretch gap-2 pt-2">
              {booking?.status === "IN_SERVICE" && !allPhotosCaptured && (
                <p className="text-xs font-semibold text-warning text-right">
                  {missingPhotoSlots.length} angle photo{missingPhotoSlots.length > 1 ? "s" : ""} still needed:{" "}
                  {missingPhotoSlots.map((s) => s.title).join(", ")}
                </p>
              )}
              {!allChecklistReviewed && (
                <p className="text-xs font-semibold text-destructive text-right">
                  Add a remark for: {failedItemsMissingRemark.map((i) => i.label).join(", ")}
                </p>
              )}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCompleteInspectionAndHandover}
                  disabled={isSubmitting || !allPhotosCaptured || !allChecklistReviewed}
                  className="flex-1 py-3.5 rounded-xl bg-success text-success-foreground hover:opacity-90 disabled:opacity-50 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>{isSubmitting ? "Completing Handover..." : "Complete Inspection & Handover"}</span>
                </button>
              </div>
            </div>
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
