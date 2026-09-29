import { create } from "zustand"
import type { ChatMessage } from "../types/ai.types"

interface AIChatState {
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

export const useAIChatStore = create<AIChatState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  activePrompt: "",

  setActivePrompt: (prompt) => set({ activePrompt: prompt }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      error: null,
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
    })),

  clearMessages: () =>
    set({
      messages: [],
      error: null,
      activePrompt: "",
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}))
