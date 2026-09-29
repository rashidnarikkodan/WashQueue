import { useCallback } from "react"
import { useAIChatStore } from "../store/ai-chat.store"
import { aiApi } from "@/shared/apis/ai.api"
import { ChatMessage } from "../types/ai.types"

export const useAIChat = () => {
  const {
    messages,
    isLoading,
    error,
    activePrompt,
    setActivePrompt,
    addMessage,
    updateMessage,
    clearMessages,
    setLoading,
    setError,
  } = useAIChatStore()

  const sendMessage = useCallback(
    async (promptToSend?: string) => {
      const prompt = (promptToSend ?? activePrompt).trim()
      if (!prompt || isLoading) return

      const userMessageId = `user-${Date.now()}`
      const assistantMessageId = `assistant-${Date.now() + 1}`

      const userMessage: ChatMessage = {
        id: userMessageId,
        role: "user",
        content: prompt,
        timestamp: new Date().toISOString(),
        status: "success",
      }

      const pendingAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        status: "pending",
      }

      addMessage(userMessage)
      addMessage(pendingAssistantMessage)
      setActivePrompt("")
      setLoading(true)
      setError(null)

      try {
        const responseContent = await aiApi.ask(prompt)
        updateMessage(assistantMessageId, {
          content: responseContent,
          status: "success",
        })
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to generate AI response. Please ensure Ollama is running."
        updateMessage(assistantMessageId, {
          content: "",
          status: "error",
          error: errorMessage,
        })
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [activePrompt, isLoading, addMessage, setActivePrompt, setLoading, setError, updateMessage]
  )

  const retryLastMessage = useCallback(async () => {
    if (isLoading || messages.length === 0) return

    // Find the last user message
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
    if (!lastUserMessage) return

    await sendMessage(lastUserMessage.content)
  }, [isLoading, messages, sendMessage])

  return {
    messages,
    isLoading,
    error,
    activePrompt,
    setActivePrompt,
    sendMessage,
    retryLastMessage,
    clearMessages,
  }
}
