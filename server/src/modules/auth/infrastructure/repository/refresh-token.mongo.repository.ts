import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token.repository"
import { RefreshToken } from "../../domain/entities/refresh-token.entity"
import { User as UserModel } from "@/modules/user/infrastructure/model/user.model"

export class RefreshTokenMongoRepository implements IRefreshTokenRepository {
  async save(userId: string, token: RefreshToken): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { refreshToken: token.token } }).exec()
  }

  async findByUserId(userId: string): Promise<RefreshToken | null> {
    const user = await UserModel.findById(userId).select("refreshToken").exec()
    if (!user || !user.refreshToken) {
      return null
    }
    return new RefreshToken(user.refreshToken)
  }

  async clear(userId: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { refreshToken: "" } }).exec()
  }
}
