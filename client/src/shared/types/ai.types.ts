export interface AskAIPayload {
  prompt: string
}

export interface AskAIResponse {
  success: boolean
  data: string
  message: string
}
