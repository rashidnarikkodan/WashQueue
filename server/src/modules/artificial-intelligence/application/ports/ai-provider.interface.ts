export interface LLMRequest {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  format?: "json" | Record<string, unknown>
}

export interface LLMResponse {
  content: string
}

export interface IEmbeddingProvider {
  embed(text: string): Promise<number[]>
  embedBatch(texts: string[]): Promise<number[][]>
}

export interface ILLMProvider {
  generate(request: LLMRequest): Promise<LLMResponse>
  generateStructured<T = unknown>(request: LLMRequest): Promise<T>
}
