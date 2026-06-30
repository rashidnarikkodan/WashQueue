import { IUserRepository } from "../../domain/repositories/user.repository"
import { User } from "../../domain/entities/User"
import { IGetUserUseCase } from "../interfaces/user-usecases.interfaces"

export class GetUserUseCase implements IGetUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<User | null> {
    return await this.userRepository.findById(id)
  }
}
