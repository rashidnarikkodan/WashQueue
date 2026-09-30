import env from "@/configs/env.config"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"

import {
  ILLMProvider,
  LLMRequest,
  LLMResponse,
} from "../../application/ports/ai-provider.interface"

interface OllamaGenerateResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

const DEFAULT_GENERATE_TIMEOUT_MS = 45000

export class OllamaProvider implements ILLMProvider {
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const options: Record<string, unknown> = {
      num_predict: request.maxTokens ?? 512,
      temperature: request.temperature ?? 0.3,
    }

    try {
      const response = await fetch(`${env.OLLAMA_BASE_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.OLLAMA_LLM_MODEL,
          prompt: request.prompt,
          system: request.systemPrompt,
          stream: false,
          options,
        }),
        signal: AbortSignal.timeout(DEFAULT_GENERATE_TIMEOUT_MS),
      })

      if (!response.ok) {
        let errorMessage = `${response.status} ${response.statusText}`
        try {
          const errorBody = (await response.json()) as { error?: string }
          if (errorBody?.error) {
            errorMessage = errorBody.error
          }
        } catch {
          // Fallback to HTTP status text
        }
        throw new Error(`Ollama request failed: ${errorMessage}`)
      }

      const data = (await response.json()) as OllamaGenerateResponse

      return {
        content: (data.response ?? "").trim(),
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "TimeoutError" || error.name === "AbortError") {
          throw new AppError(
            `AI generation timed out after ${DEFAULT_GENERATE_TIMEOUT_MS / 1000}s. The model may still be loading or under high load.`,
            HTTP_STATUS.SERVICE_UNAVAILABLE
          )
        }
        if ("cause" in error && typeof error.cause === "object" && error.cause !== null) {
          const cause = error.cause as { code?: string }
          if (cause.code === "ECONNREFUSED") {
            throw new AppError(
              `AI LLM service unreachable at ${env.OLLAMA_BASE_URL}. Ensure Ollama is running.`,
              HTTP_STATUS.SERVICE_UNAVAILABLE
            )
          }
        }
      }
      throw error
    }
  }
}
