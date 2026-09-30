export interface ChatRequestDto {
  message: string
  latitude?: number
  longitude?: number
  stationId?: string
  bookingNumber?: string
}

export interface ChatUserContext {
  userId?: string
  email?: string
  role?: string
}

export interface ChatResponseDto {
  message: string
  intent: string
  confidence?: number
  metadata?: Record<string, unknown>
}
