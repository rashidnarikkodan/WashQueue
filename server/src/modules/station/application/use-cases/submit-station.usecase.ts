import { AppError } from "@/common/errors/app-error"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ValidationError } from "@/common/errors/validation-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { Station, StationStatus } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { IStationPricingRepository } from "../../domain/repositories/station-pricing.repository"
import { ISubmitStationUseCase } from "../interfaces/station-usecases.interface"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"

export class SubmitStationUseCase implements ISubmitStationUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly stationPricingRepository: IStationPricingRepository
  ) {}

  async execute(stationId: string, userId: string): Promise<Station> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    const owner = await this.ownerRepository.findByUserId(userId)

    if (station.ownerId !== owner?.id) {
      throw new ForbiddenError("You are not authorized to submit this station")
    }

    if (!owner?.isVerified) {
      throw new ForbiddenError("Your owner account is pending approval by an administrator before you can submit stations.")
    }


    if (station.status !== StationStatus.DRAFT && station.status !== StationStatus.REJECTED) {
      throw new AppError("Only draft or rejected stations can be submitted for review", HTTP_STATUS.BAD_REQUEST)
    }

    const props = station.getProps()
    const errors: { field: string; message: string }[] = []

    // 1. Basic station information exists
    if (!props.name || props.name.trim() === "") {
      errors.push({ field: "name", message: "Station name is required" })
    }
    if (!props.contact?.phone || props.contact.phone.trim() === "") {
      errors.push({ field: "contact.phone", message: "Contact phone is required" })
    }
    if (!props.contact?.email || props.contact.email.trim() === "") {
      errors.push({ field: "contact.email", message: "Contact email is required" })
    }
    if (!props.address?.street || props.address.street.trim() === "") {
      errors.push({ field: "address.street", message: "Street address is required" })
    }
    if (!props.address?.city || props.address.city.trim() === "") {
      errors.push({ field: "address.city", message: "City is required" })
    }
    if (!props.address?.state || props.address.state.trim() === "") {
      errors.push({ field: "address.state", message: "State is required" })
    }
    if (!props.address?.country || props.address.country.trim() === "") {
      errors.push({ field: "address.country", message: "Country is required" })
    }
    if (!props.address?.pincode || props.address.pincode.trim() === "") {
      errors.push({ field: "address.pincode", message: "Pincode is required" })
    }

    // 2. Valid location exists
    if (
      !props.location ||
      typeof props.location.latitude !== "number" ||
      typeof props.location.longitude !== "number" ||
      (props.location.latitude === 0 && props.location.longitude === 0)
    ) {
      errors.push({
        field: "location",
        message: "Valid location coordinates (latitude and longitude) are required",
      })
    }

    // 3. At least one image exists
    if (!props.images || props.images.length === 0) {
      errors.push({ field: "images", message: "At least one station image is required" })
    }

    // 4. Operating hours are configured
    if (!props.operatingHours || props.operatingHours.length === 0) {
      errors.push({ field: "operatingHours", message: "Operating hours must be configured" })
    }

    // 5. Slot configuration is complete
    const slot = props.slotConfig
    if (!slot) {
      errors.push({ field: "slotConfig", message: "Slot configuration is required" })
    } else {
      if (typeof slot.bays !== "number" || slot.bays <= 0) {
        errors.push({ field: "slotConfig.bays", message: "Bays must be at least 1" })
      }
      if (typeof slot.windowDurationMins !== "number" || slot.windowDurationMins <= 0) {
        errors.push({
          field: "slotConfig.windowDurationMins",
          message: "Window duration must be a positive number of minutes",
        })
      }
      if (typeof slot.capacityPerWindow !== "number" || slot.capacityPerWindow <= 0) {
        errors.push({
          field: "slotConfig.capacityPerWindow",
          message: "Capacity per window must be at least 1",
        })
      }
      if (typeof slot.maxAdvanceBookingDays !== "number" || slot.maxAdvanceBookingDays <= 0) {
        errors.push({
          field: "slotConfig.maxAdvanceBookingDays",
          message: "Max advance booking days must be at least 1",
        })
      }
    }

    // 6. At least one pricing record exists and required pricing values are valid
    const pricing = await this.stationPricingRepository.findByStationId(stationId)
    if (!pricing || pricing.length === 0) {
      errors.push({
        field: "pricing",
        message: "At least one pricing record must exist for the station",
      })
    } else {
      pricing.forEach((p, idx) => {
        const pProps = p.getProps()
        if (typeof pProps.halfWashPrice !== "number" || pProps.halfWashPrice < 0) {
          errors.push({
            field: `pricing[${idx}].halfWashPrice`,
            message: "Half wash price must be a non-negative number",
          })
        }
        if (typeof pProps.fullWashPrice !== "number" || pProps.fullWashPrice < 0) {
          errors.push({
            field: `pricing[${idx}].fullWashPrice`,
            message: "Full wash price must be a non-negative number",
          })
        }
      })
    }

    if (errors.length > 0) {
      throw new ValidationError("Station is incomplete for submission", errors)
    }

    // Call submit() on domain entity to transition status to PENDING_REVIEW
    station.submit()

    return this.stationRepository.save(station)
  }
}
