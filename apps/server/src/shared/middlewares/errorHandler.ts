import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/shared/errors/AppError';
import { env } from '@/config/env';

interface ErrorResponse {
  status: 'error' | 'fail';
  message: string;
  stack?: string;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      status: err.statusCode >= 500 ? 'error' : 'fail',
      message: err.message,
    };

    if (env.node_env === 'development') {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Unhandled/programming error
  console.error('UNHANDLED ERROR:', err);

  const response: ErrorResponse = {
    status: 'error',
    message: env.node_env === 'production' ? 'Something went wrong' : err.message,
  };

  if (env.node_env === 'development') {
    response.stack = err.stack;
  }

  res.status(500).json(response);
}
