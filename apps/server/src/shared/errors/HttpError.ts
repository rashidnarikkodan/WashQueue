import { AppError } from '@/shared/errors/AppError';

export class HttpError extends AppError {
  constructor(statusCode: number, message: string) {
    super(message, statusCode);
  }

  static badRequest(message = 'Bad Request'): HttpError {
    return new HttpError(400, message);
  }

  static unauthorized(message = 'Unauthorized'): HttpError {
    return new HttpError(401, message);
  }

  static forbidden(message = 'Forbidden'): HttpError {
    return new HttpError(403, message);
  }

  static notFound(message = 'Not Found'): HttpError {
    return new HttpError(404, message);
  }

  static conflict(message = 'Conflict'): HttpError {
    return new HttpError(409, message);
  }

  static internalServer(message = 'Internal Server Error'): HttpError {
    return new HttpError(500, message);
  }
}
