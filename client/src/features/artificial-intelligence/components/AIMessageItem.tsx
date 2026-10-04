import React, { useState } from "react"
import { Copy, Check, AlertCircle, RotateCcw } from "lucide-react"
import type { ChatMessage } from "../types/ai.types"
import { toast } from "sonner"

interface AIMessageItemProps {
  message: ChatMessage
  onRetry?: () => void
}

// ── inline markdown renderer ──────────────────────────────────────────────────
const renderInline = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={i} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code
          key={i}
          className="px-2 py-0.5 rounded-md bg-muted text-foreground text-[0.88em] font-mono border border-border/40"
        >
          {part.slice(1, -1)}
        </code>
      )
    return part
  })
}

const formatContent = (content: string) =>
  content.split("\n\n").map((block, i) => {
    const lines = block.split("\n")
    if (block.startsWith("### "))
      return (
        <h4 key={i} className="text-xs sm:text-sm font-semibold text-foreground mt-2.5 mb-1">
          {renderInline(block.slice(4))}
        </h4>
      )
    if (block.startsWith("## "))
      return (
        <h3 key={i} className="text-sm sm:text-base font-bold text-foreground mt-3 mb-1.5">
          {renderInline(block.slice(3))}
        </h3>
      )
    if (block.startsWith("# "))
      return (
        <h2 key={i} className="text-base sm:text-lg font-bold text-foreground mt-4 mb-2">
          {renderInline(block.slice(2))}
        </h2>
      )
    if (lines.every((l) => /^[-*]\s/.test(l.trim())))
      return (
        <ul
          key={i}
          className="list-disc list-inside space-y-1 my-2 text-foreground/90 text-sm sm:text-[14.5px]"
        >
          {lines.map((l, j) => (
            <li key={j} className="leading-relaxed">
              {renderInline(l.replace(/^[-*]\s+/, ""))}
            </li>
          ))}
        </ul>
      )
    if (lines.every((l) => /^\d+\.\s/.test(l.trim())))
      return (
        <ol
          key={i}
          className="list-decimal list-inside space-y-1 my-2 text-foreground/90 text-sm sm:text-[14.5px]"
        >
          {lines.map((l, j) => (
            <li key={j} className="leading-relaxed">
              {renderInline(l.replace(/^\d+\.\s+/, ""))}
            </li>
          ))}
        </ol>
      )
    return (
      <p
        key={i}
        className="leading-relaxed text-foreground/90 mb-2 last:mb-0 text-sm sm:text-[14.5px]"
      >
        {renderInline(block)}
      </p>
    )
  })

// ── component ─────────────────────────────────────────────────────────────────
export const AIMessageItem: React.FC<AIMessageItemProps> = ({ message, onRetry }) => {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === "user"
  const isPending = message.status === "pending"
  const isError = message.status === "error"

  const handleCopy = async () => {
    if (!message.content) return
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  // ── User bubble ──────────────────────────────────────────────────────────
  if (isUser) {
    return (
      <div className="flex justify-end my-3 sm:my-3.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
        <div className="max-w-[85%] sm:max-w-[75%] px-4.5 py-3 sm:px-5 sm:py-3.5 rounded-2xl rounded-tr-sm bg-muted/80 hover:bg-muted text-foreground border border-border/70 text-sm sm:text-[14.5px] leading-relaxed shadow-xs font-normal">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    )
  }

  // ── Assistant message ────────────────────────────────────────────────────
  return (
    <div className="group flex items-start gap-3 sm:gap-3.5 my-4 sm:my-4.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Standalone large Qyn avatar */}
      <img
        src="/QynAi.png"
        alt="Qyn"
        className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 mt-0.5"
        draggable={false}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {isPending ? (
          // Typing dots
          <div className="flex items-center gap-1.5 py-2 h-7">
            <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" />
          </div>
        ) : isError ? (
          <div className="p-3.5 sm:p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-xs sm:text-sm max-w-lg shadow-xs">
            <div className="flex items-center gap-2 font-bold text-destructive mb-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Could not generate a response</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {message.error ?? "Service timed out or unavailable. Please try again."}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Try again
              </button>
            )}
          </div>
        ) : (
          <div className="text-sm sm:text-[14.5px] leading-relaxed break-words text-foreground">
            <div className="space-y-0.5">{formatContent(message.content)}</div>

            {/* Copy action */}
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-transparent hover:border-border transition-all duration-150 cursor-pointer"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
