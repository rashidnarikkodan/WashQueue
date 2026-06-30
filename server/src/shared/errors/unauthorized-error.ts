import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { AppError } from "./app-error"

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, HTTP_STATUS.UNAUTHORIZED)
  }
}
