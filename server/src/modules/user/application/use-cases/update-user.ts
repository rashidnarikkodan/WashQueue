import { IUserRepository } from "../../domain/repositories/user.repository";

export class UpdateUser {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, updates: { isBlocked?: boolean; name?: string; email?: string; phone?: string }) {
    return await this.userRepository.update(id, updates);
  }
}
