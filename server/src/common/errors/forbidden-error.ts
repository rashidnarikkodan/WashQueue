import { HTTP_STATUS } from "@/common/constants/http.constants"
import { AppError } from "./app-error"

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, HTTP_STATUS.FORBIDDEN)
  }
}
