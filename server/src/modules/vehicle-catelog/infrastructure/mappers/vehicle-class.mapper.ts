import { IVehicleClass } from "../models/class.model"
import { VehicleClass } from "../../domain/entities/VehicleClass"
import { IMapper } from "@/core/domain/repository.interface"
import { Types } from "mongoose"

export class VehicleClassMapper implements IMapper<VehicleClass, IVehicleClass> {
  static toDomain(raw: IVehicleClass): VehicleClass {
    return new VehicleClass({
      id: raw._id.toString(),
      categoryId: raw.categoryId.toString(),
      name: raw.name,
      slug: raw.slug,
      order: raw.order,
    })
  }

  static toPersistence(entity: Partial<VehicleClass>): Partial<IVehicleClass> {
    const raw: Partial<IVehicleClass> = {}
    if (entity.categoryId !== undefined) raw.categoryId = new Types.ObjectId(entity.categoryId) as any
    if (entity.name !== undefined) raw.name = entity.name
    if (entity.slug !== undefined) raw.slug = entity.slug
    if (entity.order !== undefined) raw.order = entity.order
    return raw
  }

  toDomain(raw: IVehicleClass): VehicleClass {
    return VehicleClassMapper.toDomain(raw)
  }

  toPersistence(entity: Partial<VehicleClass>): Partial<IVehicleClass> {
    return VehicleClassMapper.toPersistence(entity)
  }
}
