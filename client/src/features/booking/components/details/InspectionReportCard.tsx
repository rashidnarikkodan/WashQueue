import React from "react"
import { ShieldCheck, FileText, Camera, CheckCircle2, XCircle } from "lucide-react"

export interface InspectionChecklistItem {
  itemId?: string
  label?: string
  name?: string
  passed?: boolean
  notes?: string
}

export interface InspectionPhoto {
  public_id?: string
  url?: string
  secured_url?: string
  caption?: string
}

export interface InspectionData {
  inspectorName?: string
  inspectedAt?: string | Date
  notes?: string
  photos?: InspectionPhoto[]
  checklist?: InspectionChecklistItem[]
  odometerReading?: number
  fuelLevel?: string
}

interface InspectionReportCardProps {
  title: string
  type: "PRE" | "POST"
  inspection?: InspectionData | null
  actionButton?: React.ReactNode
  statusBadgeText?: string
  statusBadgeClass?: string
  emptyMessage?: string
}

export const InspectionReportCard: React.FC<InspectionReportCardProps> = ({
  title,
  type,
  inspection,
  actionButton,
  statusBadgeText,
  statusBadgeClass,
  emptyMessage,
}) => {
  const isPre = type === "PRE"
  const photos = inspection?.photos || []
  const checklist = inspection?.checklist || []

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${
              isPre
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            {inspection?.inspectedAt && (
              <p className="text-[11px] text-muted-foreground font-medium">
                Logged on {new Date(inspection.inspectedAt).toLocaleString()}
                {inspection.inspectorName ? ` by ${inspection.inspectorName}` : ""}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {statusBadgeText && (
            <span
              className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                statusBadgeClass || "bg-muted text-muted-foreground border border-border"
              }`}
            >
              {statusBadgeText}
            </span>
          )}
          {actionButton}
        </div>
      </div>

      {inspection ? (
        <div className="space-y-4">
          {/* Photos grid */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Camera size={12} />
                Inspection Photos ({photos.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {photos.map((photo, idx) => {
                  const imgUrl = photo.secured_url || photo.url
                  return (
                    <a
                      key={idx}
                      href={imgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-xl overflow-hidden border border-border/80 hover:border-primary/50 bg-muted/40 transition-all cursor-pointer"
                    >
                      <img
                        src={imgUrl}
                        alt={photo.caption || `Inspection Photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {photo.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-xs p-1 text-[9px] text-slate-200 truncate font-medium">
                          {photo.caption}
                        </div>
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Checklist details */}
          {checklist.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Condition Checklist
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {checklist.map((item, idx) => {
                  const passed = item.passed !== false
                  const label = item.label || item.name || `Checklist Item ${idx + 1}`
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
                        passed
                          ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                          : "bg-amber-500/5 border-amber-500/20 text-foreground"
                      }`}
                    >
                      {passed ? (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <p className="font-bold">{label}</p>
                        {item.notes && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notes section */}
          {inspection.notes && (
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Inspector Notes
              </span>
              <p className="text-foreground leading-relaxed">{inspection.notes}</p>
            </div>
          )}

          {/* Odometer / Fuel if pre-service */}
          {(inspection.odometerReading !== undefined || inspection.fuelLevel) && (
            <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground pt-1">
              {inspection.odometerReading !== undefined && (
                <span>Odometer: {inspection.odometerReading.toLocaleString()} km</span>
              )}
              {inspection.fuelLevel && <span>Fuel: {inspection.fuelLevel}</span>}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-border/80 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-muted-foreground shrink-0" />
            <span>
              {emptyMessage ||
                (isPre
                  ? "Pre-service vehicle condition inspection has not been recorded."
                  : "Post-service quality inspection will be logged upon wash completion.")}
            </span>
          </div>
          {actionButton}
        </div>
      )}
    </div>
  )
}

export default InspectionReportCard
