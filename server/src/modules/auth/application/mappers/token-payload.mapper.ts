import { User } from "@/modules/user/domain/entities/User"
import { TokenPayload } from "../interfaces/token-service.interface"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"

export class TokenPayloadMapper {
  static async toTokenPayload(
    user: User,
    ownerRepository?: IOwnerRepository
  ): Promise<TokenPayload> {
    let ownerId: string | undefined
    if (ownerRepository && user.id) {
      const owner = await ownerRepository.findByUserId(user.id)
      if (owner?.id) {
        ownerId = owner.id
      }
    }

    return {
      userId: user.id!,
      role: user.role,
      email: user.email,
      ...(ownerId ? { ownerId } : {}),
    }
  }
}
