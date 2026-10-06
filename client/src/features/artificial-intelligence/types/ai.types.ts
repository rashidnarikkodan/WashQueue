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

export interface AIChatState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  activePrompt: string

  setActivePrompt: (prompt: string) => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}