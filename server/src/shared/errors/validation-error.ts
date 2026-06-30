import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { AppError } from "./app-error"

export class ValidationError extends AppError {
  constructor(message: string = "Validation Error", details: unknown = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, details)
  }
}
