import { Request, Response, NextFunction } from 'express';
import { HttpError } from '@/shared/errors/HttpError';

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(HttpError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
