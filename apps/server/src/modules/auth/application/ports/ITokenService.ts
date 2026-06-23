/**
 * Port interface for token generation/verification.
 * Decouples the application layer from JWT implementation details.
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface ITokenService {
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(payload: TokenPayload): string;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
}
