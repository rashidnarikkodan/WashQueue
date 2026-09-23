import { useState, useRef, useEffect } from "react"
import { X, AlertCircle, Upload, Trash2, Loader2, LifeBuoy } from "lucide-react"
import { toast } from "sonner"
import { issueApi } from "@/shared/apis/issue.api"
import { bookingApi } from "@/shared/apis/booking.api"
import { IssueCategory, IssuePriority, type Evidence, type IssueDto } from "../types/issue.types"

interface CreateIssueModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId?: string
  bookingNumber?: string
  stationName?: string
  vehicleName?: string
  onSuccess?: (newIssue: IssueDto) => void
}

export default function CreateIssueModal({
  isOpen,
  onClose,
  bookingId = "",
  bookingNumber = "",
  stationName = "",
  vehicleName = "",
  onSuccess,
}: CreateIssueModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [enteredBookingId, setEnteredBookingId] = useState(bookingId)
  const [category, setCategory] = useState<string>(IssueCategory.VEHICLE_DAMAGE)
  const [priority, setPriority] = useState<IssuePriority>(IssuePriority.MEDIUM)
  const [description, setDescription] = useState("")
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (bookingId) {
      queueMicrotask(() => {
        setEnteredBookingId(bookingId)
      })
    }
  }, [bookingId])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
        document.body.style.overflow = "hidden"
      }
    } else {
      if (dialog.open) {
        dialog.close()
        document.body.style.overflow = ""
      }
    }
  }, [isOpen])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (evidenceList.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 evidence photos.")
      return
    }

    setIsUploadingFiles(true)
    setError(null)

    try {
      const { signature, timestamp, folder, apiKey, cloudName } =
        await bookingApi.getInspectionUploadSignature()

      const uploadPromises = Array.from(files).map(async (file, idx) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("api_key", apiKey)
        formData.append("timestamp", String(timestamp))
        formData.append("signature", signature)
        formData.append("folder", folder)

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const result = await response.json()
        return {
          public_id: result.public_id || `proof-${Date.now()}-${idx}`,
          url: result.secure_url || result.url,
          description: file.name,
        }
      })

      const uploadedResults = await Promise.all(uploadPromises)
      setEvidenceList((prev) => [...prev, ...uploadedResults])
      toast.success(`${uploadedResults.length} photo(s) uploaded successfully.`)
    } catch (uploadErr) {
      const msg =
        uploadErr instanceof Error ? uploadErr.message : "Photo upload failed. Please try again."
      setError(msg)
      toast.error(msg)
    } finally {
      setIsUploadingFiles(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((item) => item.public_id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetBookingId = bookingId || enteredBookingId.trim()

    if (!targetBookingId) {
      setError("Please specify a valid Booking ID.")
      return
    }

    if (description.trim().length < 5) {
      setError("Please describe the issue in detail (at least 5 characters).")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const created = await issueApi.createIssue({
        bookingId: targetBookingId,
        customerDescription: description.trim(),
        customerEvidence: evidenceList,
        category,
        priority,
      })

      toast.success("Support ticket logged successfully! Our team will review shortly.")
      onSuccess?.(created)
      onClose()
      setDescription("")
      setEvidenceList([])
    } catch (err: unknown) {
      const errObj = err as { message?: string }
      setError(errObj?.message || "Failed to submit support issue.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
      className="fixed inset-0 m-auto bg-card border border-border shadow-2xl rounded-3xl p-0 w-full max-w-xl max-h-[90vh] overflow-hidden backdrop:bg-background/80 backdrop:backdrop-blur-md text-foreground text-left"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Raise Support Ticket</h3>
            <p className="text-xs text-muted-foreground">
              Report an issue with your service booking
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]"
      >
        {/* Context info if available */}
        {(bookingNumber || stationName || vehicleName) && (
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span>{vehicleName || "Vehicle Service"}</span>
              <span className="font-mono text-primary">#{bookingNumber || bookingId}</span>
            </div>
            {stationName && <p className="text-xs text-muted-foreground">{stationName}</p>}
          </div>
        )}

        {!bookingId && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Booking ID / Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={enteredBookingId}
              onChange={(e) => setEnteredBookingId(e.target.value)}
              placeholder="e.g. BK-99201 or booking ID"
              className="w-full px-4 py-2.5 rounded-xl bg-muted/40 text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Issue Category <span className="text-red-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/40 text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all"
            >
              {Object.values(IssueCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Severity / Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as IssuePriority)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/40 text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all"
            >
              <option value={IssuePriority.LOW}>Low - Minor Query / Cosmetic</option>
              <option value={IssuePriority.MEDIUM}>Medium - Standard Concern</option>
              <option value={IssuePriority.HIGH}>High - Incomplete Wash / Delay</option>
              <option value={IssuePriority.CRITICAL}>Critical - Damage / Severe Incident</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Describe what happened <span className="text-red-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please detail the issue clearly (e.g. scratch noticed on bodywork, wash quality missed tire shine, billing discrepancy)..."
            className="w-full px-4 py-3 rounded-xl bg-muted/40 text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all resize-none placeholder:text-muted-foreground leading-relaxed"
          />
        </div>

        {/* Upload Photos Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Upload Evidence Photos (Optional)
            </label>
            <span className="text-[11px] text-muted-foreground">Max 5 photos</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingFiles || evidenceList.length >= 5}
            className="w-full p-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50"
          >
            {isUploadingFiles ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Uploading photos to cloud...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-primary" />
                <span>Click to upload evidence photos</span>
              </>
            )}
          </button>

          {evidenceList.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {evidenceList.map((item) => (
                <div
                  key={item.public_id}
                  className="relative aspect-4/3 rounded-xl overflow-hidden border border-border bg-muted/40 group"
                >
                  <img src={item.url} alt="Evidence" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveEvidence(item.public_id)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 text-white hover:bg-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isUploadingFiles}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isUploadingFiles}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? "Submitting..." : "Submit Ticket"}</span>
          </button>
        </div>
      </form>
    </dialog>
  )
}
