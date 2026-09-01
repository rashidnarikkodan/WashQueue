import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import env from "@/configs/env.config"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import redis from "@/infrastructure/cache/redis.client"

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    role: string
    email: string
  }
}

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined

    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    if (!token && req.cookies) {
      token = req.cookies.accessToken
    }

    if (!token) {
      throw new UnauthorizedError("Authentication token is missing")
    }

    let decoded: {
      userId: string
      role: string
      email: string
    }
    try {
      decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
        userId: string
        role: string
        email: string
      }
    } catch {
      throw new UnauthorizedError("Invalid or expired authentication token")
    }

    const isBlacklisted = await redis.get(`blocked:${decoded.userId}`)
    if (isBlacklisted) {
      throw new UnauthorizedError("Your account has been suspended by the administrator")
    }

    req.user = decoded
    next()
  } catch (error) {
    next(error)
  }
}

export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined

    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    if (!token && req.cookies) {
      token = req.cookies.accessToken
    }

    if (token) {
      const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
        userId: string
        role: string
        email: string
      }
      const isBlacklisted = await redis.get(`blocked:${decoded.userId}`)
      if (!isBlacklisted) {
        req.user = decoded
      }
    }
  } catch {
  }
  next()
}
