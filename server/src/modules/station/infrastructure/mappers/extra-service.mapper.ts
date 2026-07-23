import { Types } from "mongoose"
import { ExtraService, ExtraServiceProps } from "../../domain/entities/ExtraService"
import { IExtraService } from "../models/extra-service.model"

export class ExtraServiceMapper {
  static toDomain(raw: IExtraService): ExtraService {
    const props: ExtraServiceProps = {
      id: raw._id.toString(),
      stationId: raw.stationId.toString(),
      name: raw.name,
      slug: raw.slug,
      description: raw.description ?? "",
      pricing: (raw.pricing ?? []).map((p) => ({
        vehicleClassId: p.vehicleClassId.toString(),
        price: p.price,
      })),
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
    return new ExtraService(props)
  }

  static toPersistence(entity: Partial<ExtraService>): Partial<IExtraService> {
    if (entity && typeof entity.getProps === "function") {
      const props = entity.getProps()
      const raw: Partial<IExtraService> = {
        name: props.name,
        slug: props.slug,
        description: props.description,
        pricing: props.pricing.map((p) => ({
          vehicleClassId: new Types.ObjectId(p.vehicleClassId),
          price: p.price,
        })),
        isActive: props.isActive,
      }
      if (props.stationId) {
        raw.stationId = new Types.ObjectId(props.stationId)
      }
      return raw
    }
    return {}
  }
}
