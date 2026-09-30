import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"

export interface AskAIPayload {
  prompt?: string
  message?: string
}

export interface ChatResponseData {
  message: string
  intent?: string
  confidence?: number
  metadata?: Record<string, unknown>
}

export interface AskAIResponse {
  success: boolean
  data: string | ChatResponseData
  message: string
}

export const aiApi = {
  ask: async (prompt: string): Promise<string> => {
    try {
      const response = await api.post<AskAIResponse>(
        API_ROUTES.AI.CHAT,
        { prompt, message: prompt },
        {
          timeout: 90000, // 90 seconds for LLM generation
          skipToast: true, // We handle errors directly in UI chat stream
        }
      )
      const data = response.data?.data
      if (typeof data === "string") {
        return data
      }
      if (data && typeof data === "object" && "message" in data) {
        return data.message ?? ""
      }
      return String(data ?? "")
    } catch (error) {
      handleApiError(error, "Failed to generate AI response")
      throw error
    }
  },
}
