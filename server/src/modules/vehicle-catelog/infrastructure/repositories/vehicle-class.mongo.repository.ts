import { VehicleClassModel, IVehicleClass } from "../models/class.model"
import { VehicleClass } from "../../domain/entities/VehicleClass"
import { VehicleClassMapper } from "../mappers/vehicle-class.mapper"
import { IVehicleClassRepository } from "../../domain/repositories/vehicle-class.repsoitory"
import { BaseRepository } from "@/infrastructure/database/repository/base.repository"

export class VehicleClassMongoRepository extends BaseRepository<VehicleClass, IVehicleClass> implements IVehicleClassRepository {
  constructor() {
    super(VehicleClassModel, new VehicleClassMapper())
  }

  async findAll(filter?: { categoryId?: string }): Promise<VehicleClass[]> {
    const query: Record<string, any> = {}
    if (filter?.categoryId) {
      query.categoryId = filter.categoryId
    }
    const docs = await this.model.find(query).sort({ order: 1, name: 1 }).exec()
    return docs.map(doc => this.mapper.toDomain(doc))
  }

  async findBySlug(slug: string): Promise<VehicleClass | null> {
    const doc = await this.model.findOne({ slug }).exec()
    return doc ? this.mapper.toDomain(doc) : null
  }

  async findByName(name: string): Promise<VehicleClass | null> {
    const doc = await this.model.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } }).exec()
    return doc ? this.mapper.toDomain(doc) : null
  }
}
