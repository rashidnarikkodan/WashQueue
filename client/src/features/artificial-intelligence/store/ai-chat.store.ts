import { create } from "zustand"
import type { AIChatState } from "../types/ai.types"

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
