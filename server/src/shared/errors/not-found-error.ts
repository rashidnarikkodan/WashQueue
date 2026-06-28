import { AppError } from "./app-error"

export class NotFoundError extends AppError {
  constructor(message: string = "Resource Not Found") {
    super(message, 404)
  }
}
