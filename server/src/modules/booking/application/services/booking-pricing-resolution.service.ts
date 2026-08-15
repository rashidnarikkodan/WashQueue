import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IStationPricingRepository } from "@/modules/station/domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "@/modules/station/domain/repositories/extra-service.repository"

export interface ResolvedExtraService {
  serviceId: string
  name: string
  price: number
}

export interface ResolvedPricingAndExtras {
  basePrice: number
  selectedExtraServices: ResolvedExtraService[]
}

export class BookingPricingResolutionService {
  constructor(
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository
  ) {}

  // strict=true throws on an invalid/inactive extra (new bookings/reservations); strict=false
  // silently skips it (confirming an already-created reservation, where extras were validated
  // at creation time and shouldn't block confirmation if station config later changed).
  async resolve(
    stationId: string,
    vehicleClassId: string,
    serviceType: "HALF" | "FULL",
    extraServiceIds: string[] = [],
    strict = true
  ): Promise<ResolvedPricingAndExtras> {
    const pricings = await this.stationPricingRepository.findByStationId(stationId)
    const pricing = pricings.find((p) => p.vehicleClassId === vehicleClassId && p.isActive)
    if (!pricing) {
      throw new AppError(
        "Station does not support or have active pricing for this vehicle class",
        HTTP_STATUS.BAD_REQUEST
      )
    }
    const basePrice = serviceType === "FULL" ? pricing.fullWashPrice : pricing.halfWashPrice

    const availableExtras = await this.extraServiceRepository.findByStationId(stationId)
    const selectedExtraServices: ResolvedExtraService[] = []

    for (const extraId of extraServiceIds) {
      const extra = availableExtras.find((e) => e.id === extraId && e.isActive)
      if (!extra) {
        if (strict) {
          throw new AppError(
            `Extra service ${extraId} is invalid or inactive for this station`,
            HTTP_STATUS.BAD_REQUEST
          )
        }
        continue
      }
      const classPricing = extra.pricing.find((p) => p.vehicleClassId === vehicleClassId)
      selectedExtraServices.push({
        serviceId: extra.id,
        name: extra.name,
        price: classPricing ? classPricing.price : 0,
      })
    }

    return { basePrice, selectedExtraServices }
  }
}
