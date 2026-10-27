import { Station, StationProps } from "../../domain/entities/Station"
import { StationPricing, StationPricingProps } from "../../domain/entities/StationPricing"
import { ExtraService, ExtraServiceProps } from "../../domain/entities/ExtraService"
import { StationDetailResponseDto } from "../dtos/get-station.dto"

export interface StationResponseDTO extends StationProps {
  distanceKm?: number
  startingPrice?: number
  halfWashPrice?: number
  fullWashPrice?: number
  estimatedWaitMins?: number
  queueDepth?: number
  isOpen?: boolean
  isFavorite?: boolean
}

export class StationDTOMapper {
  static toDTO(
    station: Station,
    extras?: {
      distanceKm?: number
      startingPrice?: number
      halfWashPrice?: number
      fullWashPrice?: number
      estimatedWaitMins?: number
      queueDepth?: number
      isOpen?: boolean
      isFavorite?: boolean
    }
  ): StationResponseDTO {
    const props = station.getProps()
    const stationExtras = station as unknown as Record<string, unknown>

    return {
      id: props.id,
      ownerId: props.ownerId,
      managerId: props.managerId,
      name: props.name,
      description: props.description,
      contact: {
        phone: props.contact?.phone || "",
        email: props.contact?.email || "",
      },
      location: {
        latitude: props.location?.latitude ?? 0,
        longitude: props.location?.longitude ?? 0,
      },
      address: {
        street: props.address?.street || "",
        city: props.address?.city || "",
        state: props.address?.state || "",
        country: props.address?.country || "",
        pincode: props.address?.pincode || "",
      },
      images: (props.images || []).map((img) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: img.isPrimary,
      })),
      operatingHours: (props.operatingHours || []).map((oh) => ({
        day: oh.day,
        open: oh.open,
        close: oh.close,
        isClosed: oh.isClosed,
      })),
      holidays: (props.holidays || []).map((h) => ({
        date: h.date,
        reason: h.reason,
      })),
      slotConfig: props.slotConfig
        ? {
            bays: props.slotConfig.bays,
            windowDurationMins: props.slotConfig.windowDurationMins,
            capacityPerWindow: props.slotConfig.capacityPerWindow,
            walkInReservedSlots: props.slotConfig.walkInReservedSlots,
            maxAdvanceBookingDays: props.slotConfig.maxAdvanceBookingDays,
            allowWalkIns: props.slotConfig.allowWalkIns,
          }
        : {
            bays: 1,
            windowDurationMins: 30,
            capacityPerWindow: 1,
            walkInReservedSlots: 0,
            maxAdvanceBookingDays: 7,
            allowWalkIns: true,
          },
      amenities: props.amenities ? [...props.amenities] : [],
      rating: props.rating ?? 0,
      reviewCount: props.reviewCount ?? 0,
      status: props.status,
      isActive: props.isActive ?? false,
      rejectionReason: props.rejectionReason,
      verifiedAt: props.verifiedAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      distanceKm: extras?.distanceKm ?? (stationExtras.distanceKm as number | undefined),
      startingPrice: extras?.startingPrice ?? (stationExtras.startingPrice as number | undefined),
      halfWashPrice: extras?.halfWashPrice ?? (stationExtras.halfWashPrice as number | undefined),
      fullWashPrice: extras?.fullWashPrice ?? (stationExtras.fullWashPrice as number | undefined),
      estimatedWaitMins:
        extras?.estimatedWaitMins ?? (stationExtras.estimatedWaitMins as number | undefined),
      queueDepth: extras?.queueDepth ?? (stationExtras.queueDepth as number | undefined),
      isOpen: extras?.isOpen ?? (stationExtras.isOpen as boolean | undefined),
      isFavorite: extras?.isFavorite ?? station.isFavorite,
    }
  }

  static toPricingDTO(pricing: StationPricing): StationPricingProps {
    const props = pricing.getProps()
    return {
      id: props.id,
      stationId: props.stationId,
      vehicleClassId: props.vehicleClassId,
      halfWashPrice: props.halfWashPrice,
      fullWashPrice: props.fullWashPrice,
      isActive: props.isActive,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    }
  }

  static toExtraServiceDTO(extraService: ExtraService): ExtraServiceProps {
    const props = extraService.getProps()
    return {
      id: props.id,
      stationId: props.stationId,
      name: props.name,
      slug: props.slug,
      description: props.description,
      pricing: props.pricing,
      isActive: props.isActive,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    }
  }

  static toDetailDTO(
    station: Station,
    pricing: StationPricing[],
    extraServices: ExtraService[]
  ): StationDetailResponseDto {
    return {
      station: StationDTOMapper.toDTO(station),
      pricing: pricing.map((p) => StationDTOMapper.toPricingDTO(p)),
      extraServices: extraServices.map((es) => StationDTOMapper.toExtraServiceDTO(es)),
    }
  }

  static toListDTO(stations: Station[]): StationResponseDTO[] {
    return stations.map((s) => StationDTOMapper.toDTO(s))
  }
}
