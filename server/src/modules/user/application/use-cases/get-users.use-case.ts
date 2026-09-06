import { IUserRepository } from "../../domain/repositories/user.repository"
import { GetUsersQuery, GetUsersResponse } from "../dto"
import { IGetUsersUseCase } from "../interfaces"

export class GetUsersUseCase implements IGetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(query: GetUsersQuery): Promise<GetUsersResponse> {
    const data = await this.userRepository.getAllUsers(query)
    return data
  }
}
