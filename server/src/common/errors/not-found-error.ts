import { HTTP_STATUS } from "@/common/constants/http.constants"
import { AppError } from "./app-error"

export class NotFoundError extends AppError {
  constructor(message: string = "Resource Not Found") {
    super(message, HTTP_STATUS.NOT_FOUND)
  }
}
