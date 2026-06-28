import { NextFunction, Request, Response } from "express"
import { AppError } from "../errors/app-error"
import logger from "../../configs/logger.config"
import env from "../../configs/env.config"

const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    })
    return
  }

  logger.error(
    {
      path: req.path,
      method: req.method,
      stack: error.stack,
    },
    `Unexpected error: ${error.message}`
  )

  const isProduction = env.NODE_ENV === "production"

  res.status(500).json({
    success: false,
    message: isProduction ? "Internal server error" : error.message,
    ...(!isProduction ? { stack: error.stack } : {}),
  })
}

export default errorMiddleware
