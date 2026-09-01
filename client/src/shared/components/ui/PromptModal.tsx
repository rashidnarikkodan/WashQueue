import { useEffect, useRef, useState } from "react"
import { MessageSquarePlus, Edit3, X, Loader2 } from "lucide-react"

export interface PromptModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (value: string) => void | Promise<void>
  title?: string
  description?: string
  label?: string
  defaultValue?: string
  placeholder?: string
  inputType?: "text" | "textarea"
  confirmText?: string
  cancelText?: string
  variant?: "primary" | "warning" | "danger" | "success"
  isLoading?: boolean
  maxLength?: number
  required?: boolean
  rows?: number
}

export default function PromptModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Add Note",
  description,
  label,
  defaultValue = "",
  placeholder = "Enter your remark...",
  inputType = "text",
  confirmText = "Save",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
  maxLength,
  required = false,
  rows = 3,
}: PromptModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [value, setValue] = useState(defaultValue)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue)

  if (isOpen !== prevIsOpen || defaultValue !== prevDefaultValue) {
    setPrevIsOpen(isOpen)
    setPrevDefaultValue(defaultValue)
    if (isOpen) {
      setValue(defaultValue || "")
      setError(null)
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
        document.body.style.overflow = "hidden"
      }
      const timer = setTimeout(() => {
        if (inputType === "textarea") {
          if (textareaRef.current) {
            textareaRef.current.focus()
            textareaRef.current.select()
          }
        } else {
          if (inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
          }
        }
      }, 50)
      return () => clearTimeout(timer)
    } else {
      if (dialog.open) {
        dialog.close()
        document.body.style.overflow = ""
      }
    }
  }, [isOpen, inputType])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const handleCancel = () => {
    if (isLoading || isSubmitting) return
    setError(null)
    onClose()
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isLoading || isSubmitting) return

    if (required && !value.trim()) {
      setError("This field cannot be empty")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(value)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (inputType === "text") {
        e.preventDefault()
        void handleSubmit()
      } else if ((e.ctrlKey || e.metaKey) && inputType === "textarea") {
        e.preventDefault()
        void handleSubmit()
      }
    }
  }

  const handleCancelClick = (e: React.SyntheticEvent) => {
    e.preventDefault()
    handleCancel()
  }

  const getConfirmButtonClasses = () => {
    const base =
      "flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md select-none shrink-0"
    if (isLoading || isSubmitting) {
      return `${base} bg-muted text-muted-foreground cursor-not-allowed border border-border`
    }
    switch (variant) {
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
      className="m-auto w-full max-w-lg rounded-2xl border border-border bg-card p-0 shadow-2xl backdrop:bg-background/80 backdrop:backdrop-blur-md overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-200"
    >
      <form onSubmit={handleSubmit} className="flex flex-col p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl border shrink-0 ${
              variant === "danger"
                ? "bg-destructive/10 border-destructive/20 text-destructive"
                : variant === "warning"
                  ? "bg-warning/10 border-warning/20 text-warning"
                  : variant === "success"
                    ? "bg-success/10 border-success/20 text-success"
                    : "bg-primary/10 border-primary/20 text-primary"
            }`}
          >
            {defaultValue ? <Edit3 size={20} /> : <MessageSquarePlus size={20} />}
          </div>

          <div className="space-y-1 grow min-w-0 text-left">
            <h3 className="text-lg font-bold text-foreground leading-snug">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading || isSubmitting}
            className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1.5 pt-1">
          {label && (
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {label}
            </label>
          )}

          {inputType === "textarea" ? (
            <textarea
              ref={textareaRef}
              rows={rows}
              value={value}
              maxLength={maxLength}
              onChange={(e) => {
                setValue(e.target.value)
                if (error) setError(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading || isSubmitting}
              className={`w-full p-3.5 rounded-xl bg-muted/60 text-foreground text-sm font-medium border transition-colors placeholder:text-muted-foreground focus:outline-none focus:bg-background ${
                error
                  ? "border-destructive focus:border-destructive ring-1 ring-destructive"
                  : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
              }`}
            />
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={value}
              maxLength={maxLength}
              onChange={(e) => {
                setValue(e.target.value)
                if (error) setError(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading || isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-muted/60 text-foreground text-sm font-medium border transition-colors placeholder:text-muted-foreground focus:outline-none focus:bg-background ${
                error
                  ? "border-destructive focus:border-destructive ring-1 ring-destructive"
                  : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
              }`}
            />
          )}

          <div className="flex items-center justify-between text-[11px] px-1">
            {error ? (
              <span className="text-destructive font-semibold">{error}</span>
            ) : inputType === "textarea" ? (
              <span className="text-muted-foreground">Press Ctrl+Enter to save</span>
            ) : (
              <span className="text-muted-foreground">Press Enter to save</span>
            )}

            {maxLength && (
              <span className="text-muted-foreground">
                {value.length}/{maxLength}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading || isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {cancelText}
          </button>

          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className={getConfirmButtonClasses()}
          >
            {(isLoading || isSubmitting) && (
              <Loader2 size={13} className="animate-spin text-muted-foreground" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </form>
    </dialog>
  )
}
