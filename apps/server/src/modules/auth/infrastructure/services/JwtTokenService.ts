import jwt from 'jsonwebtoken';
import { ITokenService, TokenPayload } from '../../application/ports/ITokenService';
import { env } from '../../../../config/env';
import { HttpError } from '../../../../shared/errors/HttpError';

/**
 * Concrete JWT implementation of ITokenService.
 * Only this class knows about jsonwebtoken.
 */
export class JwtTokenService implements ITokenService {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.jwt.secret) as TokenPayload;
    } catch {
      throw HttpError.unauthorized('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;
    } catch {
      throw HttpError.unauthorized('Invalid or expired refresh token');
    }
  }
}
