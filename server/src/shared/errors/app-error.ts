import { HTTP_STATUS } from "@/shared/constants/http.constants"

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details: unknown

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details: unknown = null,
    isOperational: boolean = true
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}
