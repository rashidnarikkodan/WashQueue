import { AppError } from "./app-error"

export class ValidationError extends AppError {
  constructor(message: string = "Validation Error", details: any = null) {
    super(message, 400, details)
  }
}
