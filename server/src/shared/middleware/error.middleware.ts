import { NextFunction, Request, Response } from "express"
import { AppError } from "../errors/app-error"
import logger from "../../configs/logger.config"
import env from "../../configs/env.config"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"

const errorMiddleware = (error: Error, req: Request, res: Response, _next: NextFunction) => {
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

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: isProduction ? ERROR_MESSAGES.INTERNAL_SERVER_ERROR : error.message,
    ...(!isProduction ? { stack: error.stack } : {}),
  })
}

export default errorMiddleware
