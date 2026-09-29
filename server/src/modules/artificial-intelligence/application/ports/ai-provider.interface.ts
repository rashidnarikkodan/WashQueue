export interface LLMRequest {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
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
}
