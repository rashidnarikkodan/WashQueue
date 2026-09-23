import { useState, useRef, useEffect } from "react"
import { X, UserCheck, Loader2, Check } from "lucide-react"
import { managerApi, type ManagerListItem } from "@/shared/apis/manager.api"
import { getInitials } from "@/shared/utils/avatar"

interface AssignManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmAssign: (managerId: string) => Promise<void>
  isSubmitting?: boolean
  currentManagerId?: string | null
  stationId?: string
}

export default function AssignManagerModal({
  isOpen,
  onClose,
  onConfirmAssign,
  isSubmitting = false,
  currentManagerId = "",
  stationId,
}: AssignManagerModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [selectedManagerId, setSelectedManagerId] = useState(currentManagerId || "")
  const [stationManagers, setStationManagers] = useState<ManagerListItem[]>([])
  const [isLoadingManagers, setIsLoadingManagers] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      setSelectedManagerId(currentManagerId || "")
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

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    void Promise.resolve().then(async () => {
      if (cancelled) return
      setIsLoadingManagers(true)
      try {
        const res = await managerApi.getOwnerManagers({
          stationId: stationId || undefined,
          limit: 50,
        })
        if (!cancelled && res && Array.isArray(res.managers)) {
          setStationManagers(res.managers)
        }
      } catch {
        // noop
      } finally {
        if (!cancelled) {
          setIsLoadingManagers(false)
        }
      }
    })

    return () => {
      cancelled = true
    }
  }, [isOpen, stationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedManagerId.trim()) return
    await onConfirmAssign(selectedManagerId.trim())
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
          <div>
            <h3 className="text-lg font-bold text-foreground">Assign Manager</h3>
            <p className="text-xs text-muted-foreground">
              Select a station manager to take ownership
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

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {isLoadingManagers ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Loading station team...</span>
          </div>
        ) : stationManagers.length > 0 ? (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Station Managers
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {stationManagers.map((mgr) => {
                const isSelected =
                  selectedManagerId === mgr.managerUserId || selectedManagerId === mgr.managerId
                return (
                  <div
                    key={mgr.assignmentId || mgr.managerUserId}
                    onClick={() => setSelectedManagerId(mgr.managerUserId || mgr.managerId)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-primary/10 border-primary shadow-xs"
                        : "bg-muted/40 border-border hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(mgr.managerName || mgr.managerEmail)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-foreground block truncate">
                          {mgr.managerName || "Station Manager"}
                        </span>
                        <span className="text-[11px] text-muted-foreground block truncate">
                          {mgr.managerEmail}
                        </span>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {stationManagers.length > 0 ? "Or Enter Manager ID / User ID" : "Manager ID / User ID"}{" "}
            <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={selectedManagerId}
            onChange={(e) => setSelectedManagerId(e.target.value)}
            placeholder="e.g. 64b8f... or Manager User ID"
            className="w-full px-4 py-2.5 rounded-xl bg-muted/40 text-foreground text-sm border border-border focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground font-mono"
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
            disabled={isSubmitting || !selectedManagerId.trim()}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? "Assigning..." : "Assign Manager"}</span>
          </button>
        </div>
      </form>
    </dialog>
  )
}
