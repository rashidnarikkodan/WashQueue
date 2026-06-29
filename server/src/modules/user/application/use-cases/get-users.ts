import { IUserRepository } from "../../domain/repositories/user.repository";
import { GetUsersQuery } from "../schema/get-users.schema";


export class GetUsers{
    constructor(
            private readonly userRepository: IUserRepository,
    ){}
    async execute(query:GetUsersQuery){
        const data = await this.userRepository.getAllUsers(query)
        return data
    }
}