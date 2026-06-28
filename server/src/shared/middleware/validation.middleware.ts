import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { ValidationError } from "../errors/validation-error"

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const details = result.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }))
      throw new ValidationError("Validation failed", details)
    }
    req.body = result.data
    next()
  }
}

