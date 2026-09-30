import env from "@/configs/env.config"
import { IEmbeddingProvider } from "../../application/ports/ai-provider.interface"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"

interface OllamaEmbedResponse {
  embeddings?: number[][]
}

interface OllamaLegacyEmbedResponse {
  embedding?: number[]
}

const DEFAULT_EMBED_TIMEOUT_MS = 15000
const MAX_CACHE_ENTRIES = 200

export class LocalEmbeddingModel implements IEmbeddingProvider {
  private readonly queryCache = new Map<string, number[]>()

  async embed(text: string): Promise<number[]> {
    const trimmed = text.trim()
    if (!trimmed) {
      throw new Error("Cannot generate embedding for empty text")
    }

    const cached = this.queryCache.get(trimmed)
    if (cached) {
      return cached
    }

    try {
      const response = await fetch(`${env.OLLAMA_BASE_URL}/api/embed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.AI_EMBEDDING_MODEL,
          input: trimmed,
        }),
        signal: AbortSignal.timeout(DEFAULT_EMBED_TIMEOUT_MS),
      })

      if (response.ok) {
        const data = (await response.json()) as OllamaEmbedResponse
        if (data.embeddings?.[0]) {
          const vector = data.embeddings[0]
          this.setCache(trimmed, vector)
          return vector
        }
      }

      // Fallback for older Ollama versions that use /api/embeddings
      const fallbackResponse = await fetch(`${env.OLLAMA_BASE_URL}/api/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.AI_EMBEDDING_MODEL,
          prompt: trimmed,
        }),
        signal: AbortSignal.timeout(DEFAULT_EMBED_TIMEOUT_MS),
      })

      if (!fallbackResponse.ok) {
        throw new Error(
          `Ollama embedding failed with status ${fallbackResponse.status}: ${fallbackResponse.statusText}`
        )
      }

      const fallbackData = (await fallbackResponse.json()) as OllamaLegacyEmbedResponse
      if (!fallbackData.embedding) {
        throw new Error("Ollama returned an empty embedding vector")
      }

      this.setCache(trimmed, fallbackData.embedding)
      return fallbackData.embedding
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "TimeoutError" || error.name === "AbortError") {
          throw new AppError(
            `Embedding service timed out after ${DEFAULT_EMBED_TIMEOUT_MS}ms`,
            HTTP_STATUS.SERVICE_UNAVAILABLE
          )
        }
        if ("cause" in error && typeof error.cause === "object" && error.cause !== null) {
          const cause = error.cause as { code?: string }
          if (cause.code === "ECONNREFUSED") {
            throw new AppError(
              `Embedding service unreachable at ${env.OLLAMA_BASE_URL}. Ensure Ollama is running.`,
              HTTP_STATUS.SERVICE_UNAVAILABLE
            )
          }
        }
      }
      throw error
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return []
    }

    try {
      const response = await fetch(`${env.OLLAMA_BASE_URL}/api/embed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.AI_EMBEDDING_MODEL,
          input: texts,
        }),
        signal: AbortSignal.timeout(DEFAULT_EMBED_TIMEOUT_MS * 2),
      })

      if (!response.ok) {
        throw new Error(`Ollama batch embedding failed: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as OllamaEmbedResponse

      if (!data.embeddings || data.embeddings.length !== texts.length) {
        throw new Error(
          `Embedding count mismatch: expected ${texts.length}, got ${data.embeddings?.length ?? 0}`
        )
      }

      return data.embeddings
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "TimeoutError" || error.name === "AbortError") {
          throw new AppError("Batch embedding request timed out", HTTP_STATUS.SERVICE_UNAVAILABLE)
        }
        if ("cause" in error && typeof error.cause === "object" && error.cause !== null) {
          const cause = error.cause as { code?: string }
          if (cause.code === "ECONNREFUSED") {
            throw new AppError(
              `Embedding service unreachable at ${env.OLLAMA_BASE_URL}. Ensure Ollama is running.`,
              HTTP_STATUS.SERVICE_UNAVAILABLE
            )
          }
        }
      }
      throw error
    }
  }

  private setCache(key: string, vector: number[]): void {
    if (this.queryCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = this.queryCache.keys().next().value
      if (oldestKey) {
        this.queryCache.delete(oldestKey)
      }
    }
    this.queryCache.set(key, vector)
  }
}
