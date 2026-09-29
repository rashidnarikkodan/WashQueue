import React, { useRef, useEffect } from "react"
import { ArrowUp, Loader2 } from "lucide-react"

interface AIPromptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (prompt?: string) => void
  isLoading: boolean
  isCentered?: boolean
  placeholder?: string
}

export const AIPromptInput: React.FC<AIPromptInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  isCentered = false,
  placeholder = "Ask anything about WashQueue services, queue wait times, or booking policies...",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea height as user types
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    const minHeight = isCentered ? 64 : 44
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), 220)
    textarea.style.height = `${newHeight}px`
  }, [value, isCentered])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading) {
        onSubmit()
      }
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !isLoading) {
      onSubmit()
    }
  }

  const canSubmit = Boolean(value.trim()) && !isLoading

  return (
    <form onSubmit={handleFormSubmit} className="w-full max-w-3xl mx-auto">
      <div
        className={`relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-200 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 ${
          isCentered ? "p-4 sm:p-5 min-h-[110px]" : "p-3 sm:p-3.5 min-h-[68px]"
        }`}
      >
        <textarea
          ref={textareaRef}
          rows={isCentered ? 2 : 1}
          value={value}
          disabled={isLoading}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden text-sm sm:text-base leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed pr-2 px-1"
        />

        <div className="flex items-center justify-between mt-2 pt-1">
          <div className="text-[11px] text-muted-foreground/50 px-1 font-mono">
            {value.length > 0 && <span>{value.length} chars</span>}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            aria-label="Send prompt"
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
              canSubmit
                ? "bg-primary text-primary-foreground shadow-md hover:opacity-90 hover:scale-105 active:scale-95 cursor-pointer"
                : "bg-muted text-muted-foreground/40 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
