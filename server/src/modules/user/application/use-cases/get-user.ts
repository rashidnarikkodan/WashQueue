import { IUserRepository } from "../../domain/repositories/user.repository";
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository";

export class GetUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly ownerRepository: IOwnerRepository,
  ) {}

  async execute(id: string) {
    const user = await this.userRepository.findById(id);
    if (user && user.role === "owner") {
      const owner = await this.ownerRepository.findByUserId(id);
      if (owner) return owner;
    }
    return user;
  }
}
