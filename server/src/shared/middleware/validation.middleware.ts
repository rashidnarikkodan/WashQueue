import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { ValidationError } from "../errors/validation-error"

type SchemaTarget = "body" | "query" | "params"

export const validateRequest = (
  schema: z.ZodSchema,
  target: SchemaTarget = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target])

    if (!result.success) {
      const details = result.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }))

      throw new ValidationError("Validation failed", details)
    }

    req[target] = result.data
    next()
  }
}
