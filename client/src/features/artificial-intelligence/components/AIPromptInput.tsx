import React, { useRef, useEffect, useState } from "react"
import { ArrowUp, Loader2, Sparkles } from "lucide-react"

interface AIPromptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (prompt?: string) => void
  isLoading: boolean
  isCentered?: boolean
  placeholder?: string
}

export function AIPromptInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  isCentered = false,
  placeholder = "Ask Qyn anything...",
}: AIPromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    const min = isCentered ? 56 : 46
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, min), 200)}px`
  }, [value, isCentered])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading) onSubmit()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !isLoading) onSubmit()
  }

  const canSubmit = Boolean(value.trim()) && !isLoading

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`rounded-[24px] sm:rounded-[26px] border bg-card/90 hover:bg-card/95 backdrop-blur-xl transition-all duration-200 ${
          isCentered ? "shadow-md hover:shadow-lg" : "shadow-xs hover:shadow-sm"
        }`}
        style={{
          borderColor: isFocused ? "rgb(var(--primary) / 0.55)" : "rgb(var(--border) / 0.8)",
          boxShadow: isFocused
            ? "0 0 0 3px rgb(var(--primary) / 0.12), 0 6px 24px rgb(0 0 0 / 0.08)"
            : undefined,
        }}
      >
        {/* Textarea */}
        <div className="px-5 pt-3.5 pb-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            disabled={isLoading}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent text-sm sm:text-[15px] text-foreground placeholder:text-muted-foreground/45 focus:outline-none leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: isCentered ? "56px" : "44px" }}
          />
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-4 pb-2.5 pt-0.5">
          {/* Helper hint / capability tag */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 select-none">
            {isFocused && value ? (
              <span className="text-[11px] text-muted-foreground/60 font-medium">
                Shift + Enter for new line
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/40 font-medium">
                <Sparkles className="w-3 h-3 text-primary/60" />
                Live WashQueue RAG
              </span>
            )}
          </div>

          {/* Circular Send button like ChatGPT / Gemini */}
          <button
            type="submit"
            disabled={!canSubmit}
            aria-label="Send message"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
              canSubmit
                ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-95 cursor-pointer shadow-sm"
                : "bg-muted text-muted-foreground/30 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
