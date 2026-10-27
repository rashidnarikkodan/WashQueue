import { Vehicle } from "../../domain/entities/Vehicle"
import { VehicleResponseDto } from "../dtos/get-vehicle.dto"

export class VehicleDTOMapper {
  static toDTO(vehicle: Vehicle): VehicleResponseDto {
    const data = vehicle.data
    return {
      id: data.id,
      userId: data.userId,
      nickname: data.nickname,
      brand: data.brand,
      model: data.model,
      year: data.year,
      registrationNumber: data.registrationNumber,
      categoryId: data.categoryId,
      classId: data.classId,
      isPrimary: data.isPrimary,
      isActive: data.isActive,
      image: data.image
        ? {
            url: data.image.url,
            publicId: data.image.publicId,
          }
        : undefined,
      createdAt: data.createdAt,
    }
  }

  static toListDTO(vehicles: Vehicle[]): VehicleResponseDto[] {
    return vehicles.map((v) => VehicleDTOMapper.toDTO(v))
  }
}
