import React, { useRef, useEffect, useState } from "react"
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
  placeholder = "Ask Qyn anything...",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    const min = isCentered ? 56 : 44
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
        className="rounded-2xl border bg-card transition-all duration-200"
        style={{
          borderColor: isFocused ? "rgb(var(--primary) / 0.6)" : "rgb(var(--border))",
          boxShadow: isFocused
            ? "0 0 0 3px rgb(var(--primary) / 0.1), 0 4px 24px rgb(0 0 0 / 0.12)"
            : "0 2px 12px rgb(0 0 0 / 0.08)",
        }}
      >
        {/* Textarea */}
        <div className="px-4 pt-4 pb-2">
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
            className="w-full resize-none bg-transparent text-sm sm:text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: isCentered ? "56px" : "44px" }}
          />
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-3">
          {/* Hint */}
          <span className="text-[11px] text-muted-foreground/40 select-none pl-1">
            {isFocused && value ? "shift+↵ for new line" : ""}
          </span>

          {/* Send button */}
          <button
            type="submit"
            disabled={!canSubmit}
            aria-label="Send"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              canSubmit
                ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-95 cursor-pointer"
                : "bg-muted text-muted-foreground/40 cursor-not-allowed"
            }`}
            style={canSubmit ? { boxShadow: "0 2px 12px rgb(var(--primary) / 0.35)" } : undefined}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
