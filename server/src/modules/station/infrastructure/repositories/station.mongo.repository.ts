import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import { IStation, StationModel } from "../models/station.model"
import { Station } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repsoitory"
import { StationMapper } from "../mappers/station.mapper"
import { Types } from "mongoose"

export class StationMongoRepository
  extends BaseRepository<Station, IStation>
  implements IStationRepository
{
  constructor() {
    super(StationModel, new StationMapper())
  }

  async findAll(filter?: { categoryId?: string; ownerId?: string }): Promise<Station[]> {
    const query: any = {}
    if (filter?.ownerId) {
      query.ownerId = new Types.ObjectId(filter.ownerId)
    }
    const docs = await this.model.find(query).sort({ name: 1 }).exec()
    return docs.map((doc) => this.mapper.toDomain(doc))
  }

  async findByOwnerId(ownerId: string): Promise<Station[]> {
    const docs = await this.model
      .find({ ownerId: new Types.ObjectId(ownerId) })
      .sort({ createdAt: -1 })
      .exec()
    return docs.map((doc) => this.mapper.toDomain(doc))
  }

  async findByName(name: string): Promise<Station | null> {
    const doc = await this.model.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } }).exec()
    return doc ? this.mapper.toDomain(doc) : null
  }
}
