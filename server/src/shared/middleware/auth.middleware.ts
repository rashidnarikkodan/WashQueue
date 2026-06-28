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
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication token is missing or invalid")
  }

  const token = authHeader.split(" ")[1]
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
