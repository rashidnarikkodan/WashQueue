import React, { useEffect, useRef } from "react"
import type { ChatMessage } from "../types/ai.types"
import { AIMessageItem } from "./AIMessageItem"

interface AIMessageListProps {
  messages: ChatMessage[]
  onRetry?: () => void
}

export const AIMessageList: React.FC<AIMessageListProps> = ({ messages, onRetry }) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="w-full flex-1 py-2 space-y-2">
      {messages.map((message) => (
        <AIMessageItem
          key={message.id}
          message={message}
          onRetry={message.status === "error" ? onRetry : undefined}
        />
      ))}
      <div ref={bottomRef} className="h-2" />
    </div>
  )
}
