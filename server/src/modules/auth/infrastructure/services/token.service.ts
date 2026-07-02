import jwt from "jsonwebtoken"
import env from "@/configs/env.config"
import { ITokenService, TokenPayload } from "../../application/interfaces/token-service.interface"

export class TokenService implements ITokenService {
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
