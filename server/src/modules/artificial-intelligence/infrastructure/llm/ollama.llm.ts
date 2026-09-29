import env from "@/configs/env.config"

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

export class OllamaProvider implements ILLMProvider {
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const options: Record<string, unknown> = {}
    if (request.temperature !== undefined) {
      options.temperature = request.temperature
    }
    if (request.maxTokens !== undefined) {
      options.num_predict = request.maxTokens
    }

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
        options: Object.keys(options).length > 0 ? options : undefined,
      }),
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
      content: data.response ?? "",
    }
  }
}
