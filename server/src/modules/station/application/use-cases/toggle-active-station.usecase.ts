import { AppError } from "@/common/errors/app-error"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { Station, StationStatus } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { IToggleActiveStationUseCase } from "../interfaces/station-usecases.interface"
import { INotificationDispatcherService } from "@/modules/notification/notification.module"

export class ToggleActiveStationUseCase implements IToggleActiveStationUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly notificationDispatcher?: INotificationDispatcherService
  ) {}

  async execute(stationId: string, userId: string): Promise<Station> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    const owner = await this.ownerRepository.findByUserId(userId)
    if (!owner || station.ownerId !== owner.id) {
      throw new ForbiddenError("You are not authorized to update this station")
    }

    if (!owner.isVerified) {
      throw new ForbiddenError("Your owner account is pending approval by an administrator.")
    }

    if (station.status !== StationStatus.ACTIVE && station.status !== StationStatus.INACTIVE) {
      throw new AppError(
        "Only approved (active or inactive) stations can be toggled",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const isNowActive = station.status === StationStatus.INACTIVE
    if (station.status === StationStatus.ACTIVE) {
      station.updateStatus(StationStatus.INACTIVE)
    } else {
      station.updateStatus(StationStatus.ACTIVE)
    }

    const savedStation = await this.stationRepository.save(station)

    if (this.notificationDispatcher) {
      try {
        await this.notificationDispatcher.dispatchToStationStakeholders({
          stationId: savedStation.id,
          notifyOwner: true,
          notifyManagers: true,
          defaultPayload: {
            type: "SYSTEM",
            title: isNowActive ? "Station Reactivated" : "Station Deactivated",
            message: `Station '${savedStation.name}' is now ${isNowActive ? "active and accepting bookings" : "temporarily inactive"}.`,
            data: {
              stationId: savedStation.id,
              stationName: savedStation.name,
              status: savedStation.status,
              url: "/owner/stations",
            },
            actionType: "NAVIGATE",
          },
        })
      } catch {
        // Non-blocking
      }
    }

    return savedStation
  }
}
