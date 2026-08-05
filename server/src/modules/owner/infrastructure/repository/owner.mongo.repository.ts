import { Owner as OwnerModel, IOwner } from "../model/owner.model"
import { Owner } from "../../domain/entities/Owner"
import { OwnerMapper } from "../mappers/owner.mapper"
import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import { Types } from "mongoose"

export class OwnerMongoRepository
  extends BaseRepository<Owner, IOwner>
  implements IOwnerRepository
{
  constructor() {
    super(OwnerModel, new OwnerMapper())
  }

  async findByUserId(userId: string): Promise<Owner | null> {
    const doc = await this.model.findOne({ userId: new Types.ObjectId(userId) }).exec()
    return doc ? this.mapper.toDomain(doc) : null
  }

  async updateIsManager(userId: string, isManager: boolean): Promise<void> {
    await this.model
      .updateOne(
        { userId: Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId },
        { $set: { isManager } }
      )
      .exec()
  }
}
