import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { HttpError } from '@/shared/errors/HttpError';

/**
 * Shared Zod request-body validation middleware factory.
 * Use this in any module's route file — keeps validation logic in one place.
 *
 * @example
 *   router.post('/register', validateRequest(RegisterInputSchema), controller.register);
 */
export function validateRequest<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const messages = (result.error as ZodError).errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');

      return next(HttpError.badRequest(messages));
    }

    // Replace body with parsed + coerced data
    req.body = result.data;
    next();
  };
}
