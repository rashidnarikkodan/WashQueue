import { IUserRepository } from "../../domain/repositories/user.repository";

export class GetUser {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string) {
    return await this.userRepository.findById(id);
  }
}
