import bcrypt from 'bcryptjs';
import { IUserRepository } from '@/modules/auth/domain/repositories/IUserRepository';
import { ITokenService } from '../ports/ITokenService';
import { InvalidCredentialsError } from '@/modules/auth/domain/errors/AuthErrors';
import { LoginInputDTO, LoginOutputDTO } from '../dtos/auth.dto';

export class LoginUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: LoginInputDTO): Promise<LoginOutputDTO> {
    // 1. Find user — use generic error to avoid user enumeration
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // 2. Verify password
    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new InvalidCredentialsError();
    }

    // 3. Generate token
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    };
  }
}
