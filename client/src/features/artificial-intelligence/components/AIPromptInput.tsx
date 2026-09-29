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
  placeholder = "Ask anything about WashQueue...",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea height as user types
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    const minHeight = isCentered ? 48 : 38
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), 180)
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
        className={`relative flex items-end gap-2 rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 ${
          isCentered ? "p-3 sm:p-3.5" : "p-2 sm:p-2.5"
        }`}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={isLoading}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 max-h-44 min-h-[38px] resize-none bg-transparent px-3 py-1.5 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          disabled={!canSubmit}
          aria-label="Send prompt"
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
            canSubmit
              ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90 hover:scale-105 active:scale-95 cursor-pointer"
              : "bg-muted text-muted-foreground/30 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <ArrowUp className="w-4.5 h-4.5 stroke-[2.5]" />
          )}
        </button>
      </div>
    </form>
  )
}
