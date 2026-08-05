export interface TokenPayload {
  userId: string
  role: string
  email: string
  ownerId?: string
}

export interface ITokenService {
  generateAccessToken(payload: TokenPayload): string
  generateRefreshToken(payload: TokenPayload): string
  verifyAccessToken(token: string): TokenPayload
  verifyRefreshToken(token: string): TokenPayload
}
