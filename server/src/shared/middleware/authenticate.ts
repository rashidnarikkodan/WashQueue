import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import env from "@/configs/env.config"
import { UnauthorizedError } from "../errors/unauthorized-error"

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    role: string
    email: string
  }
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined

  // 1. Try to read from Authorization header
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]
  }

  // 2. Try to read from cookies (parse req.headers.cookie)
  if (!token && req.headers.cookie) {
    const cookies = Object.fromEntries(
      req.headers.cookie.split(";").map((c) => {
        const parts = c.trim().split("=")
        return [parts[0], parts.slice(1).join("=")]
      })
    )
    token = cookies.accessToken
  }

  if (!token) {
    throw new UnauthorizedError("Authentication token is missing")
  }

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
      userId: string
      role: string
      email: string
    }
    req.user = decoded
    next()
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired authentication token")
  }
}
