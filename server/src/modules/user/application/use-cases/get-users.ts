import { IUserRepository } from "../../domain/repositories/user.repository";
import { GetUsersQuery } from "../schema/get-users.schema";
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository";

export class GetUsers {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly ownerRepository: IOwnerRepository,
  ) {}

  async execute(query: GetUsersQuery) {
    const data = await this.userRepository.getAllUsers(query);
    const mappedUsers = await Promise.all(
      data.users.map(async (user) => {
        if (user.role === "owner") {
          const owner = await this.ownerRepository.findByUserId(user.id);
          if (owner) return owner;
        }
        return user;
      })
    );
    return {
      ...data,
      users: mappedUsers,
    };
  }
}