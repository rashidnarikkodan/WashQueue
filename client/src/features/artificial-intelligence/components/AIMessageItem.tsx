import React, { useState } from "react"
import { Sparkles, Copy, Check, AlertCircle, RotateCcw } from "lucide-react"
import type { ChatMessage } from "../types/ai.types"
import { toast } from "sonner"

interface AIMessageItemProps {
  message: ChatMessage
  onRetry?: () => void
}

// Format markdown text with clean typography
const formatContent = (content: string) => {
  const paragraphs = content.split("\n\n")

  return paragraphs.map((para, pIdx) => {
    const lines = para.split("\n")
    const isBulletList = lines.every(
      (line) => line.trim().startsWith("- ") || line.trim().startsWith("* ")
    )
    const isNumberedList = lines.every((line) => /^\d+\.\s/.test(line.trim()))

    if (isBulletList) {
      return (
        <ul key={pIdx} className="list-disc list-inside space-y-1.5 my-2 pl-1 text-foreground/90">
          {lines.map((line, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {renderInlineStyles(line.trim().replace(/^[-*]\s+/, ""))}
            </li>
          ))}
        </ul>
      )
    }

    if (isNumberedList) {
      return (
        <ol
          key={pIdx}
          className="list-decimal list-inside space-y-1.5 my-2 pl-1 text-foreground/90"
        >
          {lines.map((line, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {renderInlineStyles(line.trim().replace(/^\d+\.\s+/, ""))}
            </li>
          ))}
        </ol>
      )
    }

    if (para.startsWith("### ")) {
      return (
        <h4 key={pIdx} className="text-sm sm:text-base font-bold text-foreground mt-3 mb-1">
          {renderInlineStyles(para.replace(/^###\s+/, ""))}
        </h4>
      )
    }
    if (para.startsWith("## ")) {
      return (
        <h3 key={pIdx} className="text-base sm:text-lg font-bold text-foreground mt-3.5 mb-1.5">
          {renderInlineStyles(para.replace(/^##\s+/, ""))}
        </h3>
      )
    }
    if (para.startsWith("# ")) {
      return (
        <h2 key={pIdx} className="text-lg sm:text-xl font-extrabold text-foreground mt-4 mb-2">
          {renderInlineStyles(para.replace(/^#\s+/, ""))}
        </h2>
      )
    }

    return (
      <p key={pIdx} className="leading-relaxed text-foreground/90 mb-2 last:mb-0">
        {renderInlineStyles(para)}
      </p>
    )
  })
}

// Inline style parser for **bold** and `code`
const renderInlineStyles = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded-md bg-muted text-primary text-xs font-mono font-medium"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

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

  // ================= USER MESSAGE =================
  if (isUser) {
    return (
      <div className="flex justify-end my-3 sm:my-4">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-br-xs px-4 py-2.5 sm:px-5 sm:py-3 bg-primary text-primary-foreground text-sm sm:text-[15px] leading-relaxed shadow-xs">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  // ================= ASSISTANT MESSAGE =================
  return (
    <div className="group flex items-start gap-3 my-4 sm:my-6 transition-opacity duration-200">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        {isPending ? (
          <div className="flex items-center gap-1.5 py-2 px-1 text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
          </div>
        ) : isError ? (
          <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex flex-col gap-2 max-w-lg">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Could not generate response</span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              {message.error || "Service unavailable. Please ensure local Ollama is active."}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-xs mt-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Try Again
              </button>
            )}
          </div>
        ) : (
          <div className="text-sm sm:text-[15px] leading-relaxed break-words space-y-1">
            {formatContent(message.content)}

            {/* Subtle action on hover */}
            <div className="pt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-medium text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
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
