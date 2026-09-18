import { useState, useRef, useEffect } from "react"
import { X, UserCheck, Loader2 } from "lucide-react"

interface AssignManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmAssign: (managerId: string) => Promise<void>
  isSubmitting?: boolean
  currentManagerId?: string | null
}

export default function AssignManagerModal({
  isOpen,
  onClose,
  onConfirmAssign,
  isSubmitting = false,
  currentManagerId = "",
}: AssignManagerModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [managerId, setManagerId] = useState(currentManagerId || "")

  useEffect(() => {
    queueMicrotask(() => {
      setManagerId(currentManagerId || "")
    })
  }, [currentManagerId])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!managerId.trim()) return
    await onConfirmAssign(managerId.trim())
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
      className="fixed inset-0 m-auto bg-card border border-border shadow-2xl rounded-3xl p-0 w-full max-w-md max-h-[90vh] overflow-hidden backdrop:bg-background/80 backdrop:backdrop-blur-md text-foreground text-left"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Assign Manager</h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Manager ID / Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            placeholder="e.g. Marcus Chen or Manager ID"
            className="w-full px-4 py-2.5 rounded-xl bg-muted/40 text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? "Assigning..." : "Assign"}</span>
          </button>
        </div>
      </form>
    </dialog>
  )
}
