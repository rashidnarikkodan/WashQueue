import { GetUsersQuery, GetUsersResponse } from "../dto/get-users.dto"
import { User } from "../../domain/entities/User"
import { UpdateUserInput } from "../dto/update-user.dto"

export interface IGetUsersUseCase {
  execute(query: GetUsersQuery): Promise<GetUsersResponse>
}

export interface IGetUserUseCase {
  execute(id: string): Promise<User | null>
}

export interface IUpdateUserUseCase {
  execute(id: string, updates: UpdateUserInput): Promise<User | null>
}
