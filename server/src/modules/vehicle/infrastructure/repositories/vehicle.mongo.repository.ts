import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import { IVehicle, VehicleModel } from "../models/vehicle.model"
import { Vehicle } from "../../domain/entities/Vehicle"
import { IVehicleRepository } from "../../domain/repositories/vehicle.repository"
import { VehicleMapper } from "../mappers/vehicle.mapper"
import { Types } from "mongoose"

export class VehicleMongoRepository
  extends BaseRepository<Vehicle, IVehicle>
  implements IVehicleRepository
{
  constructor() {
    super(VehicleModel, new VehicleMapper())
  }

  async findByUserId(userId: string): Promise<Vehicle[]> {
    const docs = await this.model
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .sort({ createdAt: -1 })
      .exec()
    return docs.map((doc) => this.mapper.toDomain(doc))
  }

  async findPrimaryByUserId(userId: string): Promise<Vehicle | null> {
    const doc = await this.model
      .findOne({ userId: new Types.ObjectId(userId), isPrimary: true, isActive: true })
      .exec()
    return doc ? this.mapper.toDomain(doc) : null
  }

  async clearPrimaryStatusForUser(userId: string): Promise<void> {
    await this.model
      .updateMany(
        { userId: new Types.ObjectId(userId), isPrimary: true },
        { $set: { isPrimary: false } }
      )
      .exec()
  }
}
