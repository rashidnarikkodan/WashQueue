import React, { useState } from "react"
import { Bot, User, Copy, Check, AlertCircle, RotateCcw } from "lucide-react"
import type { ChatMessage } from "../types/ai.types"
import { toast } from "sonner"

interface AIMessageItemProps {
  message: ChatMessage
  onRetry?: () => void
}

// Simple markdown formatter for clean formatting without heavy external libraries
const formatContent = (content: string) => {
  const paragraphs = content.split("\n\n")

  return paragraphs.map((para, pIdx) => {
    // Check if paragraph is list items
    const lines = para.split("\n")
    const isBulletList = lines.every(
      (line) => line.trim().startsWith("- ") || line.trim().startsWith("* ")
    )
    const isNumberedList = lines.every((line) => /^\d+\.\s/.test(line.trim()))

    if (isBulletList) {
      return (
        <ul key={pIdx} className="list-disc list-inside space-y-1.5 my-2 pl-1">
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
        <ol key={pIdx} className="list-decimal list-inside space-y-1.5 my-2 pl-1">
          {lines.map((line, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {renderInlineStyles(line.trim().replace(/^\d+\.\s+/, ""))}
            </li>
          ))}
        </ol>
      )
    }

    // Header check
    if (para.startsWith("### ")) {
      return (
        <h4 key={pIdx} className="text-base font-bold text-foreground mt-3 mb-1">
          {renderInlineStyles(para.replace(/^###\s+/, ""))}
        </h4>
      )
    }
    if (para.startsWith("## ")) {
      return (
        <h3 key={pIdx} className="text-lg font-bold text-foreground mt-4 mb-2">
          {renderInlineStyles(para.replace(/^##\s+/, ""))}
        </h3>
      )
    }
    if (para.startsWith("# ")) {
      return (
        <h2 key={pIdx} className="text-xl font-extrabold text-foreground mt-4 mb-2">
          {renderInlineStyles(para.replace(/^#\s+/, ""))}
        </h2>
      )
    }

    return (
      <p key={pIdx} className="leading-relaxed mb-2 last:mb-0">
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
      toast.success("Response copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy text")
    }
  }

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div
      className={`flex items-start gap-3 sm:gap-4 my-4 sm:my-6 transition-opacity duration-300 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
            : "bg-card border border-border text-primary"
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Message Content Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 sm:p-5 shadow-sm transition-all duration-200 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card/90 dark:bg-slate-900/90 border border-border/80 text-foreground rounded-tl-sm backdrop-blur-md"
        }`}
      >
        {/* User Role or Assistant Title */}
        <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-border/20 text-xs">
          <span className="font-semibold opacity-90">
            {isUser ? "You" : "WashQueue Intelligence"}
          </span>
          <span className="opacity-60 text-[11px] font-mono">{formattedTime}</span>
        </div>

        {/* Content Body */}
        {isPending ? (
          <div className="flex items-center gap-2 py-2 text-muted-foreground">
            <span className="inline-flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:200ms]" />
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:400ms]" />
            </span>
            <span className="text-xs font-medium ml-1">
              Searching knowledge base & drafting response...
            </span>
          </div>
        ) : isError ? (
          <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">Unable to generate response</span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              {message.error || "Ollama service may be offline or the model is loading."}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Question
              </button>
            )}
          </div>
        ) : (
          <div className="text-sm sm:text-base leading-relaxed break-words">
            {formatContent(message.content)}
          </div>
        )}

        {/* Assistant Bottom Toolbar */}
        {!isUser && !isPending && !isError && (
          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span className="text-[11px] opacity-70">Synthesized with RAG Context</span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Copy answer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span className="text-success font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
