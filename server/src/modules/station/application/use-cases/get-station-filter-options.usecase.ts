import { IVehicleCategoryRepository } from "@/modules/vehicle-catelog/domain/repositories/vehicle-category.repsoitory"
import { IVehicleClassRepository } from "@/modules/vehicle-catelog/domain/repositories/vehicle-class.repsoitory"
import { IStationPricingRepository } from "../../domain/repositories/station-pricing.repository"
import { ICacheService } from "@/core/application/interfaces/cache.interface"
import { IGetStationFilterOptionsUseCase } from "../interfaces/station-usecases.interface"
import { StationFilterOptionsDTO } from "../dtos/station-filter-options.dto"

const CACHE_KEY = "cache:stations:filter_options"
const CACHE_TTL_SECONDS = 86400 // 24h

const STATIC_AMENITIES = [
  { slug: "wifi", name: "Free Wi-Fi", icon: "wifi" },
  { slug: "waiting_lounge", name: "AC Waiting Lounge", icon: "sofa" },
  { slug: "cafe", name: "Café / Coffee", icon: "coffee" },
  { slug: "ev_charging", name: "EV Charging", icon: "zap" },
  { slug: "restroom", name: "Clean Restrooms", icon: "bath" },
]

const STATIC_SORT_OPTIONS = [
  { value: "RECOMMENDED", label: "Recommended" },
  { value: "DISTANCE", label: "Nearest" },
  { value: "RATING", label: "Highest Rated" },
  { value: "WAIT_TIME", label: "Shortest Wait Time" },
  { value: "PRICE_LOW_TO_HIGH", label: "Price: Low to High" },
  { value: "PRICE_HIGH_TO_LOW", label: "Price: High to Low" },
]

const DEFAULT_PRICE_BOUNDS = { minHalf: 10, maxHalf: 200, minFull: 20, maxFull: 300 }

export class GetStationFilterOptionsUseCase implements IGetStationFilterOptionsUseCase {
  constructor(
    private readonly vehicleCategoryRepository: IVehicleCategoryRepository,
    private readonly vehicleClassRepository: IVehicleClassRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly cacheService: ICacheService
  ) {}

  async execute(): Promise<StationFilterOptionsDTO> {
    try {
      const cached = await this.cacheService.get(CACHE_KEY)
      if (cached) {
        return JSON.parse(cached) as StationFilterOptionsDTO
      }
    } catch {
      // Cache read failure falls through to computing fresh options below.
    }

    const [categories, classes, priceBounds] = await Promise.all([
      this.vehicleCategoryRepository.findAll(),
      this.vehicleClassRepository.findAll(),
      this.stationPricingRepository.getActivePriceBounds(),
    ])

    const bounds = priceBounds ?? DEFAULT_PRICE_BOUNDS
    const minPrice = Math.min(bounds.minHalf ?? 10, bounds.minFull ?? 20)
    const maxPrice = Math.max(bounds.maxHalf ?? 200, bounds.maxFull ?? 300)

    const payload: StationFilterOptionsDTO = {
      vehicleCategories: categories
        .filter((c) => c.isActive)
        .map((c) => ({ id: c.id, slug: c.slug, name: c.name })),
      vehicleClasses: classes
        .filter((c) => c.isActive)
        .map((c) => ({ id: c.id, categoryId: c.categoryId, slug: c.slug, name: c.name })),
      amenities: STATIC_AMENITIES,
      priceBounds: {
        minPrice,
        maxPrice,
        currency: "INR",
      },
      sortOptions: STATIC_SORT_OPTIONS,
    }

    try {
      await this.cacheService.set(CACHE_KEY, JSON.stringify(payload), CACHE_TTL_SECONDS)
    } catch {
      // Cache write failure is non-fatal — the computed payload is still returned below.
    }

    return payload
  }
}
