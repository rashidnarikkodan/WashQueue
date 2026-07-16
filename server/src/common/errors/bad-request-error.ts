import { HTTP_STATUS } from "@/common/constants/http.constants"
import { AppError } from "./app-error"

export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request", details: unknown = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, details)
  }
}
