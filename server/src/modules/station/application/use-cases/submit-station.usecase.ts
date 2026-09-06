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
import { NotificationDispatcherService } from "@/modules/notification/notification.module"

export class SubmitStationUseCase implements ISubmitStationUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly notificationDispatcher?: NotificationDispatcherService
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
      throw new ForbiddenError(
        "Your owner account is pending approval by an administrator before you can submit stations."
      )
    }

    if (station.status !== StationStatus.DRAFT && station.status !== StationStatus.REJECTED) {
      throw new AppError(
        "Only draft or rejected stations can be submitted for review",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const props = station.getProps()
    const errors: { field: string; message: string }[] = []

    if (!props.name || !props.name.trim()) {
      errors.push({ field: "name", message: "Station name is required" })
    }
    if (!props.contact?.phone || !props.contact.phone.trim()) {
      errors.push({ field: "contact.phone", message: "Contact phone is required" })
    }
    if (!props.contact?.email || !props.contact.email.trim()) {
      errors.push({ field: "contact.email", message: "Contact email is required" })
    }

    const addr = props.address
    if (!addr) {
      errors.push({ field: "address", message: "Address information is required" })
    } else {
      if (!addr.street || !addr.street.trim()) {
        errors.push({ field: "address.street", message: "Street address is required" })
      }
      if (!addr.city || !addr.city.trim()) {
        errors.push({ field: "address.city", message: "City is required" })
      }
      if (!addr.state || !addr.state.trim()) {
        errors.push({ field: "address.state", message: "State is required" })
      }
      if (!addr.pincode || !addr.pincode.trim()) {
        errors.push({ field: "address.pincode", message: "Pincode is required" })
      }
    }

    const loc = props.location
    if (!loc) {
      errors.push({ field: "location", message: "Location coordinates are required" })
    } else {
      if (
        typeof loc.latitude !== "number" ||
        typeof loc.longitude !== "number" ||
        isNaN(loc.latitude) ||
        isNaN(loc.longitude)
      ) {
        errors.push({
          field: "location",
          message: "Valid coordinates (latitude and longitude) are required",
        })
      }
    }

    const opHours = props.operatingHours
    if (!opHours || opHours.length === 0) {
      errors.push({
        field: "operatingHours",
        message: "Operating hours must be specified for at least one day",
      })
    } else {
      const hasOpenDay = opHours.some((h) => !h.isClosed)
      if (!hasOpenDay) {
        errors.push({
          field: "operatingHours",
          message: "Station must be open on at least one day of the week",
        })
      }
    }

    const slot = props.slotConfig
    if (!slot) {
      errors.push({ field: "slotConfig", message: "Slot configuration is required" })
    } else {
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

    station.submit()

    const savedStation = await this.stationRepository.save(station)

    if (this.notificationDispatcher) {
      try {
        // 1. Notify Owner
        await this.notificationDispatcher.dispatch({
          recipientId: userId,
          type: "SYSTEM",
          title: "Station Submitted for Verification",
          message: `Your station '${savedStation.name}' has been submitted for admin review.`,
          data: {
            stationId: savedStation.id,
            stationName: savedStation.name,
            url: "/owner/stations",
          },
          actionType: "NAVIGATE",
        })

        // 2. Notify Platform Admins
        await this.notificationDispatcher.dispatchToAdmins({
          type: "SYSTEM",
          title: "New Station Awaiting Approval",
          message: `Station '${savedStation.name}' was submitted for review.`,
          data: {
            stationId: savedStation.id,
            stationName: savedStation.name,
            ownerId: owner.id,
            url: "/admin/stations",
          },
          actionType: "NAVIGATE",
        })
      } catch {
        // Non-blocking
      }
    }

    return savedStation
  }
}
