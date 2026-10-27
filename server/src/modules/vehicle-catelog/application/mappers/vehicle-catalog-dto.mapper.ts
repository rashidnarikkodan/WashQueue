import { VehicleCategory } from "../../domain/entities/VehicleCategory"
import { VehicleClass } from "../../domain/entities/VehicleClass"
import { CategoryResponseDto } from "../dtos/category.dto"
import { ClassResponseDto } from "../dtos/class.dto"

export class VehicleCatalogDTOMapper {
  static toCategoryDTO(category: VehicleCategory): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      order: category.order,
      isActive: category.isActive,
    }
  }

  static toCategoryListDTO(categories: VehicleCategory[]): CategoryResponseDto[] {
    return categories.map((c) => VehicleCatalogDTOMapper.toCategoryDTO(c))
  }

  static toClassDTO(vehicleClass: VehicleClass): ClassResponseDto {
    return {
      id: vehicleClass.id,
      categoryId: vehicleClass.categoryId,
      name: vehicleClass.name,
      slug: vehicleClass.slug,
      description: vehicleClass.description,
      order: vehicleClass.order,
      isActive: vehicleClass.isActive,
    }
  }

  static toClassListDTO(classes: VehicleClass[]): ClassResponseDto[] {
    return classes.map((c) => VehicleCatalogDTOMapper.toClassDTO(c))
  }
}
