import { IUserRepository } from "../../domain/repositories/user.repository"
import { GetUsersQuery, GetUsersResponse } from "../dto"
import { IGetUsersUseCase } from "../interfaces"
import { UserDTOMapper } from "../mappers/user-dto.mapper"

export class GetUsersUseCase implements IGetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(query: GetUsersQuery): Promise<GetUsersResponse> {
    const data = await this.userRepository.getAllUsers(query)
    return UserDTOMapper.toListResponse(data)
  }
}
