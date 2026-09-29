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
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-muted text-foreground text-[0.8em] font-mono"
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
        <h4 key={i} className="text-sm font-bold text-foreground mt-4 mb-1">
          {renderInline(block.slice(4))}
        </h4>
      )
    if (block.startsWith("## "))
      return (
        <h3 key={i} className="text-base font-bold text-foreground mt-5 mb-1.5">
          {renderInline(block.slice(3))}
        </h3>
      )
    if (block.startsWith("# "))
      return (
        <h2 key={i} className="text-lg font-extrabold text-foreground mt-6 mb-2">
          {renderInline(block.slice(2))}
        </h2>
      )
    if (lines.every((l) => /^[-*]\s/.test(l.trim())))
      return (
        <ul key={i} className="list-disc list-inside space-y-1 my-2 text-foreground/90">
          {lines.map((l, j) => (
            <li key={j} className="leading-relaxed">
              {renderInline(l.replace(/^[-*]\s+/, ""))}
            </li>
          ))}
        </ul>
      )
    if (lines.every((l) => /^\d+\.\s/.test(l.trim())))
      return (
        <ol key={i} className="list-decimal list-inside space-y-1 my-2 text-foreground/90">
          {lines.map((l, j) => (
            <li key={j} className="leading-relaxed">
              {renderInline(l.replace(/^\d+\.\s+/, ""))}
            </li>
          ))}
        </ol>
      )
    return (
      <p key={i} className="leading-relaxed text-foreground/85 mb-2 last:mb-0">
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
      toast.success("Copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  // ── User bubble ──────────────────────────────────────────────────────────
  if (isUser) {
    return (
      <div className="flex justify-end my-4">
        <div className="max-w-[80%] sm:max-w-[72%] px-4 py-3 rounded-2xl rounded-br-sm bg-primary text-primary-foreground text-sm sm:text-[15px] leading-relaxed">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  // ── Assistant message ────────────────────────────────────────────────────
  return (
    <div className="group flex items-start gap-3 my-5">
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center shrink-0 mt-0.5"
        style={{ boxShadow: "0 2px 6px rgb(var(--primary) / 0.1)" }}
      >
        <img src="/qyn-logo.svg" alt="Qyn" className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {isPending ? (
          // Typing dots
          <div className="flex items-center gap-1 py-2 h-7">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
          </div>
        ) : isError ? (
          <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/8 text-sm max-w-lg">
            <div className="flex items-center gap-2 font-medium text-destructive mb-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Could not generate a response</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
              {message.error ?? "Service unavailable. Make sure Ollama is running."}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Try again
              </button>
            )}
          </div>
        ) : (
          <div className="text-sm sm:text-[15px] leading-relaxed break-words">
            <div className="space-y-0.5">{formatContent(message.content)}</div>

            {/* Copy action — appears on hover */}
            <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent hover:border-border transition-all duration-150 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-primary" />
                    <span className="text-primary font-medium">Copied</span>
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
