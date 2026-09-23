import { useState, useEffect } from "react"
import { FileText, Loader2, Save } from "lucide-react"

interface InvestigationNotesEditorProps {
  initialNotes?: string | null
  onSave: (notes: string) => Promise<void>
  isSaving?: boolean
  readOnly?: boolean
}

export default function InvestigationNotesEditor({
  initialNotes = "",
  onSave,
  isSaving = false,
  readOnly = false,
}: InvestigationNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes || "")

  useEffect(() => {
    queueMicrotask(() => {
      setNotes(initialNotes || "")
    })
  }, [initialNotes])

  const handleSave = () => {
    onSave(notes)
  }

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-primary" />
          INTERNAL INVESTIGATION NOTES
        </span>
      </div>

      <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-xl space-y-3">
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={readOnly || isSaving}
          placeholder="Enter investigation findings, staff testimonies, CCTV reviews..."
          className="w-full bg-muted/40 text-foreground text-xs sm:text-sm p-4 rounded-2xl border border-border focus:border-primary focus:outline-none transition-all resize-none placeholder:text-muted-foreground leading-relaxed font-normal"
        />

        {!readOnly && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs flex items-center gap-2 border border-border transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              ) : (
                <Save className="w-3.5 h-3.5 text-primary" />
              )}
              <span>{isSaving ? "Saving..." : "Save Draft"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
