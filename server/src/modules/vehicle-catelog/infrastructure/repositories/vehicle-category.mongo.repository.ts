import { VehicleCategoryModel, IVehicleCategory } from "../models/category.model"
import { VehicleCategory } from "../../domain/entities/VehicleCategory"
import { VehicleCategoryMapper } from "../mappers/vehicle-category.mapper"
import { IVehicleCategoryRepository } from "../../domain/repositories/vehicle-category.repsoitory"
import { BaseRepository } from "@/infrastructure/database/repository/base.repository"

export class VehicleCategoryMongoRepository extends BaseRepository<VehicleCategory, IVehicleCategory> implements IVehicleCategoryRepository {
  constructor() {
    super(VehicleCategoryModel, new VehicleCategoryMapper())
  }

  async findAll(): Promise<VehicleCategory[]> {
    const docs = await this.model.find().sort({ order: 1, name: 1 }).exec()
    return docs.map(doc => this.mapper.toDomain(doc))
  }

  async findBySlug(slug: string): Promise<VehicleCategory | null> {
    const doc = await this.model.findOne({ slug }).exec()
    return doc ? this.mapper.toDomain(doc) : null
  }

  async findByName(name: string): Promise<VehicleCategory | null> {
    const doc = await this.model.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } }).exec()
    return doc ? this.mapper.toDomain(doc) : null
  }
}
