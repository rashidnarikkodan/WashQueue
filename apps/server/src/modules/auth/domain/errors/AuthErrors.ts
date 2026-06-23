import { AppError } from '../../../../shared/errors/AppError';

export class UserAlreadyExistsError extends AppError {
  constructor(email: string) {
    super(`A user with email "${email}" already exists`, 409);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('Invalid email or password', 401);
  }
}

export class UserNotFoundError extends AppError {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`, 404);
  }
}

export class AccountNotVerifiedError extends AppError {
  constructor() {
    super('Please verify your email before logging in', 403);
  }
}
