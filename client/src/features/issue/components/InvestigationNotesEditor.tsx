import { FileText, Loader2, Save, Check } from "lucide-react"

interface InvestigationNotesEditorProps {
  notes?: string | null
  onChange: (notes: string) => void
  onSave: (notes: string) => Promise<void>
  isSaving?: boolean
  readOnly?: boolean
  initialSavedNotes?: string | null
}

export default function InvestigationNotesEditor({
  notes = "",
  onChange,
  onSave,
  isSaving = false,
  readOnly = false,
  initialSavedNotes = "",
}: InvestigationNotesEditorProps) {
  const safeNotes = notes ?? ""
  const safeInitialNotes = initialSavedNotes ?? ""
  const isDirty = safeNotes.trim() !== safeInitialNotes.trim()

  const handleSave = () => {
    onSave(safeNotes)
  }

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span>INTERNAL INVESTIGATION NOTES</span>
        </span>

        {isDirty && !readOnly && (
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Unsaved changes
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-xl space-y-3">
        <textarea
          rows={4}
          value={safeNotes}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly || isSaving}
          placeholder="Document investigation findings, technician testimonies, wash bay optical audit notes..."
          className="w-full bg-muted/40 text-foreground text-xs sm:text-sm p-4 rounded-2xl border border-border focus:border-primary focus:outline-none transition-all resize-y min-h-[100px] placeholder:text-muted-foreground leading-relaxed font-normal"
        />

        {!readOnly && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted-foreground font-mono">
              {safeNotes.length} characters
            </span>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                isDirty
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted text-muted-foreground border border-border opacity-70"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Notes...</span>
                </>
              ) : isDirty ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Notes Saved</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
