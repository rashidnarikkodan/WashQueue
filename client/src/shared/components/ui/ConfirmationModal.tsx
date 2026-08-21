import { useEffect, useRef, useState } from "react"
import { AlertTriangle, AlertCircle, CheckCircle, Info, Loader2, X } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: "primary" | "danger" | "warning" | "success"
  isLoading?: boolean
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone. Please confirm to proceed.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  isLoading = false,
}: ConfirmationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync native dialog state with isOpen prop
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
        // Prevent background scrolling
        document.body.style.overflow = "hidden"
      }
    } else {
      if (dialog.open) {
        dialog.close()
        document.body.style.overflow = ""
      }
    }
  }, [isOpen])

  // Clean up overflow styling on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const handleCancel = () => {
    if (isLoading || isSubmitting) return
    onClose()
  }

  const handleConfirm = async () => {
    if (isLoading || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onConfirm()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Close when native ESC is pressed
  const handleCancelClick = (e: React.SyntheticEvent) => {
    e.preventDefault()
    handleCancel()
  }

  // Icon based on variant
  const getIcon = () => {
    const iconSize = 22
    switch (confirmVariant) {
      case "danger":
        return <AlertTriangle size={iconSize} className="text-destructive" />
      case "warning":
        return <AlertCircle size={iconSize} className="text-warning" />
      case "success":
        return <CheckCircle size={iconSize} className="text-success" />
      default:
        return <Info size={iconSize} className="text-primary" />
    }
  }

  // Button styles based on variant
  const getConfirmButtonClasses = () => {
    const base =
      "flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md select-none shrink-0"
    if (isLoading || isSubmitting) {
      return `${base} bg-muted text-muted-foreground cursor-not-allowed border border-border`
    }
    switch (confirmVariant) {
      case "danger":
        return `${base} bg-destructive hover:opacity-90 text-destructive-foreground hover:shadow-destructive/20 border border-destructive/20`
      case "warning":
        return `${base} bg-warning hover:opacity-90 text-warning-foreground hover:shadow-warning/20 border border-warning/20`
      case "success":
        return `${base} bg-success hover:opacity-90 text-success-foreground hover:shadow-success/20 border border-success/20`
      default:
        return `${base} bg-primary hover:opacity-90 text-primary-foreground border border-primary/20`
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancelClick}
      className="m-auto w-full max-w-md rounded-2xl border border-border bg-card p-0 shadow-2xl backdrop:bg-background/80 backdrop:backdrop-blur-md overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex flex-col p-6 space-y-4">
        {/* Header Grid */}
        <div className="flex items-start gap-4">
          <div
            className={`p-2.5 rounded-xl border shrink-0 ${
              confirmVariant === "danger"
                ? "bg-destructive/10 border-destructive/20"
                : confirmVariant === "warning"
                  ? "bg-warning/10 border-warning/20"
                  : confirmVariant === "success"
                    ? "bg-success/10 border-success/20"
                    : "bg-primary/10 border-primary/20"
            }`}
          >
            {getIcon()}
          </div>

          <div className="space-y-1.5 grow min-w-0 text-left">
            <h3 className="text-lg font-bold text-foreground leading-snug">{title}</h3>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{message}</p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading || isSubmitting}
            className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading || isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || isSubmitting}
            className={getConfirmButtonClasses()}
          >
            {(isLoading || isSubmitting) && (
              <Loader2 size={13} className="animate-spin text-muted-foreground" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </dialog>
  )
}
