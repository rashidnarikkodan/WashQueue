import env from "@/configs/env.config"
import { IEmbeddingProvider } from "../../application/ports/ai-provider.interface"

interface OllamaEmbedResponse {
  embeddings: number[][]
}

// make wrapper here for api calls --marked

export class LocalEmbeddingModel implements IEmbeddingProvider {
  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${env.OLLAMA_BASE_URL}/api/embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.AI_EMBEDDING_MODEL,
        input: text,
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama embedding failed: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as OllamaEmbedResponse

    if (!data.embeddings?.[0]) {
      throw new Error("Ollama returned no embedding")
    }

    return data.embeddings[0]
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return []
    }

    const response = await fetch(`${env.OLLAMA_BASE_URL}/api/embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.AI_EMBEDDING_MODEL,
        input: texts,
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama batch embedding failed: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as OllamaEmbedResponse

    if (data.embeddings?.length !== texts.length) {
      throw new Error(
        `Embedding count mismatch: expected ${texts.length}, got ${data.embeddings?.length ?? 0}`
      )
    }

    return data.embeddings
  }
}
