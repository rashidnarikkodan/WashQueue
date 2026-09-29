import React, { useEffect, useRef } from "react"
import { Trash2, Bot, Sparkles } from "lucide-react"
import type { ChatMessage } from "../types/ai.types"
import { AIMessageItem } from "./AIMessageItem"

interface AIMessageListProps {
  messages: ChatMessage[]
  onClear: () => void
  onRetry?: () => void
}

export const AIMessageList: React.FC<AIMessageListProps> = ({ messages, onClear, onRetry }) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 pb-4">
      {/* Session Header Bar */}
      <div className="flex items-center justify-between py-3 px-4 mb-4 rounded-2xl bg-card/60 border border-border/70 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>WashQueue Knowledge Assistant</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold">
                <Sparkles className="w-2.5 h-2.5" />
                Live
              </span>
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          title="Clear chat history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 space-y-2">
        {messages.map((message) => (
          <AIMessageItem
            key={message.id}
            message={message}
            onRetry={message.status === "error" ? onRetry : undefined}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
