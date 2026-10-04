export type MessageRole = "user" | "assistant"

export type MessageStatus = "pending" | "success" | "error"

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  status?: MessageStatus
  error?: string
}

export interface PromptSuggestion {
  id: string
  title: string
  description: string
  prompt: string
  category: "service" | "queue" | "policy" | "walkin"
}
