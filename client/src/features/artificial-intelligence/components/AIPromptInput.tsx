import React, { useRef, useEffect } from "react"
import { Send, Loader2, Sparkles, X } from "lucide-react"

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
    const newHeight = Math.min(Math.max(textarea.scrollHeight, isCentered ? 80 : 52), 240)
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

  const handleClear = () => {
    onChange("")
    textareaRef.current?.focus()
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      className={`w-full transition-all duration-300 ${
        isCentered ? "max-w-4xl mx-auto" : "max-w-4xl mx-auto"
      }`}
    >
      <div
        className={`relative group rounded-3xl border border-border/80 bg-card/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10 ${
          isCentered ? "p-4 sm:p-5" : "p-3 sm:p-4"
        }`}
      >
        {/* Subtle decorative glow gradient on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Textarea Area */}
        <div className="relative flex items-start gap-3">
          <div className="hidden sm:flex mt-2 p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>

          <textarea
            ref={textareaRef}
            rows={isCentered ? 3 : 2}
            value={value}
            disabled={isLoading}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden text-sm sm:text-base leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {value && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Bottom Bar */}
        <div className="relative mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-muted/60 text-[11px] font-mono">
              Enter
            </span>
            <span className="hidden sm:inline">to send</span>
            <span className="hidden sm:inline text-muted-foreground/40">·</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-muted/60 text-[11px] font-mono">
              Shift + Enter
            </span>
            <span className="hidden sm:inline">for newline</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {value.length > 0 && (
              <span className="text-[11px] text-muted-foreground font-mono">
                {value.length} chars
              </span>
            )}

            <button
              type="submit"
              disabled={!value.trim() || isLoading}
              className={`relative inline-flex items-center justify-center gap-2 rounded-2xl font-semibold shadow-md transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${
                isCentered
                  ? "px-5 py-2.5 sm:px-6 sm:py-3 text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-primary text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-primary/20"
                  : "px-4 py-2 sm:px-5 sm:py-2.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
