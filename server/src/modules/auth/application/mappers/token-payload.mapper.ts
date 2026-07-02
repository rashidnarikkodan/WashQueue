import { User } from "@/modules/user/domain/entities/User"
import { TokenPayload } from "../interfaces/token-service.interface"

export class TokenPayloadMapper {
  static toTokenPayload(user: User): TokenPayload {
    return {
      userId: user.id,
      role: user.role,
      email: user.email,
    }
  }
}
