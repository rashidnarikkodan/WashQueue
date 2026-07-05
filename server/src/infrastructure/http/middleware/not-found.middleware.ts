import { Request, Response, NextFunction } from "express"
import { NotFoundError } from "@/common/errors/not-found-error"

const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`))
}

export default notFoundMiddleware
