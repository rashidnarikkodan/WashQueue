import { useState } from "react"
import { Camera, Scan } from "lucide-react"

export interface InspectionData {
  photos?: Array<{ secured_url: string; position?: string }>
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

  const currentData = activeTab === "pre" ? preInspection : postInspection

  const defaultInspectorNotes = [
    { label: "Bodywork condition", status: "Excellent", passed: true },
    { label: "Wheels", status: "Minor brake dust buildup", passed: true },
    { label: "Glass", status: "Clear, no chips", passed: true },
  ]

  const fallbackPhoto =
    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80"

  const photoUrl = currentData?.photos?.[0]?.secured_url || fallbackPhoto

  return (
    <div className="rounded-3xl bg-card border border-border shadow-xl overflow-hidden text-left">
      {/* Tab Navigation Header */}
      <div className="grid grid-cols-2 border-b border-border text-center">
        <button
          type="button"
          onClick={() => setActiveTab("pre")}
          className={`py-3.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-r border-border ${
            activeTab === "pre"
              ? "bg-primary/10 text-primary border-b-2 border-b-primary font-black"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          }`}
        >
          PRE-INSPECTION
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("post")}
          className={`py-3.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "post"
              ? "bg-primary/10 text-primary border-b-2 border-b-primary font-black"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          }`}
        >
          POST-INSPECTION
        </button>
      </div>

      <div className="p-6 sm:p-7 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inspection Image with Automated Scan Logs */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-border bg-black/40">
              <img
                src={photoUrl}
                alt={`${activeTab} inspection bay view`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
                <Camera className="w-3.5 h-3.5 text-primary" />
                <span>Station Camera Bay 2</span>
              </div>
            </div>

            {/* Automated Scan Logs */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5 text-primary" />
                AUTOMATED SCAN LOGS
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {activeTab === "pre"
                  ? "System detected 2 micro-scratches on hood. No damage logged for rear fenders. Scan integrity 98%."
                  : "Final post-dry optical verification complete. No new structural deviations logged. Surface gloss rating 94/100."}
              </p>
            </div>
          </div>

          {/* Inspector Notes Checklist */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-foreground block">
              Inspector Notes
            </span>

            {currentData?.checklist && currentData.checklist.length > 0 ? (
              <div className="space-y-2">
                {currentData.checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          item.passed ? "bg-emerald-400" : "bg-red-400"
                        }`}
                      />
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
              <div className="space-y-2.5">
                {defaultInspectorNotes.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-xs font-semibold text-foreground">{item.label}:</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium truncate">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {currentData?.notes && (
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  Staff Notes
                </span>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "{currentData.notes}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
