import { IVehicleCategory } from "../models/category.model"
import { VehicleCategory } from "../../domain/entities/VehicleCategory"
import { IMapper } from "@/core/domain/repository.interface"

export class VehicleCategoryMapper implements IMapper<VehicleCategory, IVehicleCategory> {
  static toDomain(raw: IVehicleCategory): VehicleCategory {
    return new VehicleCategory({
      id: raw._id.toString(),
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      order: raw.order,
      isActive: raw.isActive,
    })
  }

  static toPersistence(entity: Partial<VehicleCategory>): Partial<IVehicleCategory> {
    const raw: Partial<IVehicleCategory> = {}
    if (entity.name !== undefined) raw.name = entity.name
    if (entity.slug !== undefined) raw.slug = entity.slug
    if (entity.description !== undefined) raw.description = entity.description
    if (entity.order !== undefined) raw.order = entity.order
    if (entity.isActive !== undefined) raw.isActive = entity.isActive
    return raw
  }

  toDomain(raw: IVehicleCategory): VehicleCategory {
    return VehicleCategoryMapper.toDomain(raw)
  }

  toPersistence(entity: Partial<VehicleCategory>): Partial<IVehicleCategory> {
    return VehicleCategoryMapper.toPersistence(entity)
  }
}
