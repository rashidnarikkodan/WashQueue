import { IMapper } from "@/core/domain/repository.interface"
import { Station } from "../../domain/entities/Station"
import { IStation } from "../models/station.model"
import { Types } from "mongoose"

export class StationMapper implements IMapper<Station, IStation> {
  static toDomain(raw: IStation): Station {
    return new Station({
      id: raw._id.toString(),
      ownerId: raw.ownerId ? raw.ownerId.toString() : "",
      name: raw.name,
      description: raw.description ?? "",
      contactPhone: raw.contactPhone,
      contactEmail: raw.contactEmail,
      location: raw.location ? {
        type: "Point",
        coordinates: [raw.location.coordinates[0], raw.location.coordinates[1]]
      } : {
        type: "Point",
        coordinates: [0, 0]
      },
      address: raw.address ?? "",
      pincode: raw.pincode ?? "",
      city: raw.city ?? "",
      state: raw.state ?? "",
      images: (raw.images ?? []).map((img: any) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: img.isPrimary
      })),
      bays: raw.bays ?? 0,
      avgServiceTime: raw.avgServiceTime ?? 0,
      operatingHours: (raw.operatingHours ?? []).map((oh: any) => ({
        day: oh.day as any,
        open: oh.open,
        close: oh.close,
        isClosed: oh.isClosed
      })),
      holidays: (raw.holidays ?? []).map((h: any) => ({
        date: h.date,
        reason: h.reason
      })),
      amenities: raw.amenities ?? [],
      rating: raw.rating ?? 0,
      reviewCount: raw.reviewCount ?? 0,
      verifiedAt: raw.verifiedAt ?? null,
      rejectionReason: raw.rejectionReason ?? null,
      status: (raw.status as any) ?? "DRAFT",
      isActive: raw.isActive ?? false,
      createdAt: raw.createdAt
    })
  }

  static toPersistence(entity: Partial<Station>): Partial<IStation> {
    const raw: Partial<IStation> = {}
    
    if (entity.ownerId !== undefined) {
      raw.ownerId = new Types.ObjectId(entity.ownerId)
    }
    if (entity.name !== undefined) {
      raw.name = entity.name
    }
    if (entity.description !== undefined) {
      raw.description = entity.description
    }
    if (entity.contactPhone !== undefined) {
      raw.contactPhone = entity.contactPhone
    }
    if (entity.contactEmail !== undefined) {
      raw.contactEmail = entity.contactEmail
    }
    if (entity.location !== undefined) {
      raw.location = entity.location
    }
    if (entity.address !== undefined) {
      raw.address = entity.address
    }
    if (entity.pincode !== undefined) {
      raw.pincode = entity.pincode
    }
    if (entity.city !== undefined) {
      raw.city = entity.city
    }
    if (entity.state !== undefined) {
      raw.state = entity.state
    }
    if (entity.images !== undefined) {
      raw.images = entity.images
    }
    if (entity.bays !== undefined) {
      raw.bays = entity.bays
    }
    if (entity.avgServiceTime !== undefined) {
      raw.avgServiceTime = entity.avgServiceTime
    }
    if (entity.operatingHours !== undefined) {
      raw.operatingHours = entity.operatingHours
    }
    if (entity.holidays !== undefined) {
      raw.holidays = entity.holidays
    }
    if (entity.amenities !== undefined) {
      raw.amenities = entity.amenities
    }
    if (entity.rating !== undefined) {
      raw.rating = entity.rating
    }
    if (entity.reviewCount !== undefined) {
      raw.reviewCount = entity.reviewCount
    }
    if (entity.verifiedAt !== undefined) {
      raw.verifiedAt = entity.verifiedAt
    }
    if (entity.rejectionReason !== undefined) {
      raw.rejectionReason = entity.rejectionReason
    }
    if (entity.status !== undefined) {
      raw.status = entity.status
    }
    if (entity.isActive !== undefined) {
      raw.isActive = entity.isActive
    }
    return raw
  }

  toDomain(raw: IStation): Station {
    return StationMapper.toDomain(raw)
  }

  toPersistence(entity: Partial<Station>): Partial<IStation> {
    return StationMapper.toPersistence(entity)
  }
}
