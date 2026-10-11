import env from "@/configs/env.config"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import type {
  ILLMProvider,
  LLMRequest,
  LLMResponse,
} from "../../application/ports/ai-provider.interface"

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
  error?: {
    message?: string
  }
}

const DEFAULT_TIMEOUT_MS = 45_000

export class GeminiProvider implements ILLMProvider {
  async generate(request: LLMRequest): Promise<LLMResponse> {
    this.ensureApiKey()

    try {
      const response = await fetch(this.getEndpointUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify(this.buildPayload(request)),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      })

      if (!response.ok) {
        const errorMessage = await this.parseErrorMessage(response)
        throw new Error(`Gemini request failed: ${errorMessage}`)
      }

      const data = (await response.json()) as GeminiApiResponse
      return { content: this.extractContent(data) }
    } catch (error) {
      this.handleTimeout(error)
      throw error
    }
  }

  private ensureApiKey(): void {
    if (!env.GEMINI_API_KEY) {
      throw new AppError(
        "GEMINI_API_KEY is required to use the Gemini provider",
        HTTP_STATUS.SERVICE_UNAVAILABLE
      )
    }
  }

  private getEndpointUrl(): string {
    const baseUrl = env.GEMINI_BASE_URL.replace(/\/+$/, "")
    const model = encodeURIComponent(env.GEMINI_MODEL)
    return `${baseUrl}/v1beta/models/${model}:generateContent`
  }

  private buildPayload(request: LLMRequest) {
    return {
      contents: [
        {
          role: "user",
          parts: [{ text: request.prompt }],
        },
      ],
      ...(request.systemPrompt
        ? { systemInstruction: { parts: [{ text: request.systemPrompt }] } }
        : {}),
      generationConfig: {
        maxOutputTokens: request.maxTokens ?? 512,
        temperature: request.temperature ?? 0.3,
      },
    }
  }

  private async parseErrorMessage(response: Response): Promise<string> {
    try {
      const errorBody = (await response.json()) as GeminiApiResponse
      return errorBody.error?.message || `${response.status} ${response.statusText}`
    } catch {
      return `${response.status} ${response.statusText}`
    }
  }

  private extractContent(data: GeminiApiResponse): string {
    const parts = data.candidates?.[0]?.content?.parts ?? []
    return parts
      .map((part) => part.text ?? "")
      .join("")
      .trim()
  }

  private handleTimeout(error: unknown): void {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new AppError(
        `AI generation timed out after ${DEFAULT_TIMEOUT_MS / 1000}s.`,
        HTTP_STATUS.SERVICE_UNAVAILABLE
      )
    }
  }
}
