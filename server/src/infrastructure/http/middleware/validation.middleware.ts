import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { ValidationError } from "@/common/errors/validation-error"

type SchemaTarget = "body" | "query" | "params"

export const validateRequest = (schema: z.ZodSchema, target: SchemaTarget = "body") => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target])

    if (!result.success) {
      const details = result.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }))

      throw new ValidationError("Validation failed", details)
    }

    if (target === "query") {
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        enumerable: true,
        configurable: true,
      })
    } else {
      req[target] = result.data
    }

    next()
  }
}
