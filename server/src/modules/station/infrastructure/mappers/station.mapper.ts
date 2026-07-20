import { Types } from "mongoose"
import { IMapper } from "@/core/domain/repository.interface"
import {
  Station,
  StationProps,
  StationStatus,
} from "../../domain/entities/Station"
import { IStation } from "../models/station.model"

export class StationMapper implements IMapper<Station, IStation> {
  static toDomain(raw: IStation): Station {
    const coords = raw.location?.coordinates ?? [0, 0]

    const props: StationProps = {
      id: raw._id.toString(),
      ownerId: raw.ownerId ? raw.ownerId.toString() : "",

      name: raw.name,
      description: raw.description ?? "",

      contact: {
        phone: raw.contact?.phone ?? "",
        email: raw.contact?.email ?? "",
      },

      location: {
        longitude: coords[0],
        latitude: coords[1],
      },

      address: {
        street: raw.address?.street ?? "",
        city: raw.address?.city ?? "",
        state: raw.address?.state ?? "",
        country: raw.address?.country ?? "",
        pincode: raw.address?.pincode ?? "",
      },

      images: (raw.images ?? []).map((img) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: img.isPrimary,
      })),

      operatingHours: (raw.operatingHours ?? []).map((oh) => ({
        day: oh.day,
        open: oh.open,
        close: oh.close,
        isClosed: oh.isClosed,
      })),

      holidays: (raw.holidays ?? []).map((h) => ({
        date: h.date,
        reason: h.reason,
      })),

      slotConfig: {
        bays: raw.slotConfig?.bays ?? 0,
        windowDurationMins: raw.slotConfig?.windowDurationMins ?? 0,
        capacityPerWindow: raw.slotConfig?.capacityPerWindow ?? 0,
        walkInReservedSlots: raw.slotConfig?.walkInReservedSlots ?? 0,
        maxAdvanceBookingDays: raw.slotConfig?.maxAdvanceBookingDays ?? 0,
        bufferBetweenWindowsMins: raw.slotConfig?.bufferBetweenWindowsMins ?? 0,
        allowWalkIns: raw.slotConfig?.allowWalkIns ?? false,
      },

      amenities: raw.amenities ?? [],

      rating: raw.rating ?? 0,
      reviewCount: raw.reviewCount ?? 0,

      verifiedAt: raw.verifiedAt,
      rejectionReason: raw.rejectionReason,

      status: (raw.status as StationStatus) ?? StationStatus.DRAFT,
      isActive: raw.isActive ?? false,

      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }

    return new Station(props)
  }

  static toPersistence(entity: Partial<Station>): Partial<IStation> {
    // When called with a full Station instance from save(), use getProps()
    if (entity && typeof entity.getProps === "function") {
      const props = entity.getProps()
      return StationMapper.propsToRaw(props)
    }

    // Partial updates — not used in this module (we always save full entities)
    return {}
  }

  private static propsToRaw(props: StationProps): Partial<IStation> {
    const raw: Partial<IStation> = {
      name: props.name,
      description: props.description,
      contact: props.contact,
      location: {
        type: "Point",
        coordinates: [props.location.longitude, props.location.latitude],
      },
      address: props.address,
      images: props.images,
      operatingHours: props.operatingHours,
      holidays: props.holidays,
      slotConfig: props.slotConfig,
      amenities: props.amenities,
      rating: props.rating,
      reviewCount: props.reviewCount,
      status: props.status,
      isActive: props.isActive,
      updatedAt: props.updatedAt,
    }

    if (props.ownerId) {
      raw.ownerId = new Types.ObjectId(props.ownerId)
    }
    if (props.verifiedAt !== undefined) {
      raw.verifiedAt = props.verifiedAt
    }
    if (props.rejectionReason !== undefined) {
      raw.rejectionReason = props.rejectionReason
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
