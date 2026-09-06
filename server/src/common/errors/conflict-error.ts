import { HTTP_STATUS } from "@/common/constants/http.constants"
import { AppError } from "./app-error"

export class ConflictError extends AppError {
  constructor(message: string = "Conflict", details: unknown = null) {
    super(message, HTTP_STATUS.CONFLICT, details)
  }
}
