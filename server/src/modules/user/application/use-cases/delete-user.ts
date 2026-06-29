import { IUserRepository } from "../../domain/repositories/user.repository";

export class DeleteUser {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string) {
    return await this.userRepository.delete(id);
  }
}
