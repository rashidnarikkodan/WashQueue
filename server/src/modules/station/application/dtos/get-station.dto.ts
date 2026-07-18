import { StationProps } from "../../domain/entities/Station"
import { StationPricingProps } from "../../domain/entities/StationPricing"
import { ExtraServiceProps } from "../../domain/entities/ExtraService"

export interface StationDetailResponseDto {
  station: StationProps
  pricing: StationPricingProps[]
  extraServices: ExtraServiceProps[]
}
