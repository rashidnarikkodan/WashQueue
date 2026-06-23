import bcrypt from 'bcryptjs';
import { IUserRepository } from '@/modules/auth/domain/repositories/IUserRepository';
import { ITokenService } from '../ports/ITokenService';
import { UserAlreadyExistsError } from '@/modules/auth/domain/errors/AuthErrors';
import { RegisterInputDTO, RegisterOutputDTO } from '../dtos/auth.dto';

export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: RegisterInputDTO): Promise<RegisterOutputDTO> {
    // 1. Check uniqueness (domain rule)
    const emailTaken = await this.userRepository.existsByEmail(input.email);
    if (emailTaken) {
      throw new UserAlreadyExistsError(input.email);
    }

    // 2. Hash password (application concern)
    const passwordHash = await bcrypt.hash(input.password, 12);

    // 3. Persist new user
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'customer',
      isVerified: false,
    });

    // 4. Generate access token
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
