import { useState } from "react"
import { Camera, Scan, ZoomIn, X, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react"

export interface InspectionData {
  photos?: Array<{ secured_url: string; url?: string; position?: string }>
  notes?: string
  checklist?: Array<{ label: string; passed: boolean; remark?: string }>
  capturedAt?: string | Date
}

interface InspectionComparisonTabsProps {
  preInspection?: InspectionData | null
  postInspection?: InspectionData | null
}

export default function InspectionComparisonTabs({
  preInspection,
  postInspection,
}: InspectionComparisonTabsProps) {
  const [activeTab, setActiveTab] = useState<"pre" | "post">("pre")
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0)
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null)

  const currentData = activeTab === "pre" ? preInspection : postInspection
  const currentPhotos = currentData?.photos || []

  const activePhotoUrl =
    currentPhotos[selectedPhotoIdx]?.secured_url ||
    currentPhotos[selectedPhotoIdx]?.url ||
    currentPhotos[0]?.secured_url ||
    currentPhotos[0]?.url ||
    ""

  const activePosition = currentPhotos[selectedPhotoIdx]?.position || "Main Inspection Angle"

  return (
    <div className="rounded-3xl bg-card border border-border shadow-xl overflow-hidden text-left">
      {/* Tab Navigation Header */}
      <div className="grid grid-cols-2 border-b border-border text-center">
        <button
          type="button"
          onClick={() => {
            setActiveTab("pre")
            setSelectedPhotoIdx(0)
          }}
          className={`py-3.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-r border-border flex items-center justify-center gap-2 ${
            activeTab === "pre"
              ? "bg-primary/10 text-primary border-b-2 border-b-primary font-black"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>PRE-INSPECTION SCAN</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("post")
            setSelectedPhotoIdx(0)
          }}
          className={`py-3.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "post"
              ? "bg-primary/10 text-primary border-b-2 border-b-primary font-black"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>POST-INSPECTION SCAN</span>
        </button>
      </div>

      <div className="p-6 sm:p-7 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inspection Image Gallery */}
          <div className="lg:col-span-7 space-y-3">
            {currentPhotos.length > 0 && activePhotoUrl ? (
              <div
                onClick={() => setLightboxPhoto(activePhotoUrl)}
                className="group relative aspect-4/3 rounded-2xl overflow-hidden border border-border bg-black/40 cursor-pointer"
              >
                <img
                  src={activePhotoUrl}
                  alt={`${activeTab} inspection bay view`}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
                  <Camera className="w-3.5 h-3.5 text-primary" />
                  <span>{activePosition}</span>
                </div>

                <div className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <div className="aspect-4/3 rounded-2xl border border-border border-dashed bg-muted/20 flex flex-col items-center justify-center text-muted-foreground p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <Camera className="w-6 h-6 opacity-50" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  No inspection photos available
                </p>
                <p className="text-xs opacity-70">
                  No imagery was captured for this stage of the service.
                </p>
              </div>
            )}

            {/* Photo Angle Switcher if multiple photos exist */}
            {currentPhotos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {currentPhotos.map((photo, idx) => {
                  const pUrl = photo.secured_url || photo.url || ""
                  const isSelected = idx === selectedPhotoIdx
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPhotoIdx(idx)}
                      className={`relative w-16 h-12 rounded-xl overflow-hidden border transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/40"
                          : "border-border opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={pUrl}
                        alt={photo.position || `Angle ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {photo.position && (
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-white font-bold truncate px-1 text-center">
                          {photo.position}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Automated Scan Logs */}
            {currentPhotos.length > 0 && (
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Scan className="w-3.5 h-3.5 text-primary" />
                  AUTOMATED OPTICAL VERIFICATION LOGS
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeTab === "pre"
                    ? "Pre-wash scan captured on bay entry. Timestamped baseline condition recorded to ensure accountability."
                    : "Final post-dry optical verification complete. Verified against baseline pre-wash scan."}
                </p>
              </div>
            )}
          </div>

          {/* Inspector Notes Checklist */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-foreground block">
              Inspection Checklist &amp; Logs
            </span>

            {currentData?.checklist && currentData.checklist.length > 0 ? (
              <div className="space-y-2">
                {currentData.checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.passed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-foreground">{item.label}</span>
                    </div>
                    {item.remark && (
                      <span className="text-[11px] text-muted-foreground truncate max-w-36">
                        {item.remark}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-border border-dashed flex flex-col items-center justify-center text-center space-y-2 bg-muted/20">
                <ShieldCheck className="w-8 h-8 text-muted-foreground opacity-30 mb-1" />
                <p className="text-sm font-semibold text-foreground">No Checklist Found</p>
                <p className="text-xs text-muted-foreground max-w-48">
                  The inspection checklist was not recorded for this stage.
                </p>
              </div>
            )}

            {currentData?.notes && (
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  Staff Inspector Remarks
                </span>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "{currentData.notes}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-border bg-card shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxPhoto}
              alt="Inspection enlarged view"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
