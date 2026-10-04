import type { AskAIResponse } from "../types/ai.types"
export * from "../types/ai.types"
import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"

export const aiApi = {
  ask: async (prompt: string): Promise<string> => {
    try {
      const response = await api.post<AskAIResponse>(
        API_ROUTES.AI.CHAT,
        { prompt },
        {
          timeout: 90000, // 90 seconds for LLM generation
          skipToast: true, // We handle errors directly in UI chat stream
        }
      )
      return response.data.data
    } catch (error) {
      handleApiError(error, "Failed to generate AI response")
    }
  },
}
