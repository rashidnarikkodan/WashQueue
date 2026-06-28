import jwt from "jsonwebtoken"
import env from "@/configs/env.config"

export interface TokenPayload {
  userId: string
  role: string
  email: string
}

export class TokenService {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" })
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload
  }
}
