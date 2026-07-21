import { IMapper } from "@/core/domain/repository.interface"
import { Vehicle, VehicleProps } from "../../domain/entities/Vehicle"
import { IVehicle } from "../models/vehicle.model"
import { Types } from "mongoose"

export class VehicleMapper implements IMapper<Vehicle, IVehicle> {
  toDomain(raw: IVehicle): Vehicle {
    const props: VehicleProps = {
      id: raw._id.toString(),
      userId: raw.userId.toString(),
      nickname: raw.nickname,
      brand: raw.brand,
      model: raw.vehicle_model,
      year: raw.year,
      registrationNumber: raw.registrationNumber,
      categoryId: raw.categoryId.toString(),
      classId: raw.classId.toString(),
      isPrimary: raw.isPrimary,
      isActive: raw.isActive,
      image: raw.image,
      createdAt: raw.createdAt,
    }
    return new Vehicle(props)
  }

  toPersistence(entity: Partial<Vehicle>): Partial<IVehicle> {
    const isEntity = entity instanceof Vehicle
    const data = isEntity ? (entity as Vehicle).data : (entity as Partial<VehicleProps>)
    const persist: Partial<IVehicle> = {}

    if (data) {
      if (data.userId) persist.userId = new Types.ObjectId(data.userId)
      if (data.nickname !== undefined) persist.nickname = data.nickname
      if (data.brand !== undefined) persist.brand = data.brand
      if (data.model !== undefined) persist.vehicle_model = data.model
      if (data.year !== undefined) persist.year = data.year
      if (data.registrationNumber !== undefined) persist.registrationNumber = data.registrationNumber
      if (data.categoryId) persist.categoryId = new Types.ObjectId(data.categoryId)
      if (data.classId) persist.classId = new Types.ObjectId(data.classId)
      if (data.isPrimary !== undefined) persist.isPrimary = data.isPrimary
      if (data.isActive !== undefined) persist.isActive = data.isActive
      if (data.image !== undefined) persist.image = data.image
    }

    return persist
  }
}
