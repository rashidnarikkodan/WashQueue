import { NotFoundError } from "@/common/errors/not-found-error"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { Station } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { IReviewStationUseCase } from "../interfaces/station-usecases.interface"
import { INotificationDispatcherService } from "@/modules/notification/notification.module"

export class ReviewStationUseCase implements IReviewStationUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly notificationDispatcher?: INotificationDispatcherService
  ) {}

  async execute(
    stationId: string,
    action: "APPROVE" | "REJECT" | "SUSPEND",
    rejectionReason?: string
  ): Promise<Station> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    if (action === "APPROVE") {
      station.activate()
    } else if (action === "REJECT") {
      if (!rejectionReason || !rejectionReason.trim()) {
        throw new AppError("Rejection reason is required for rejection", HTTP_STATUS.BAD_REQUEST)
      }
      station.reject(rejectionReason.trim())
    } else if (action === "SUSPEND") {
      station.suspend(rejectionReason?.trim())
    } else {
      throw new AppError("Invalid action type", HTTP_STATUS.BAD_REQUEST)
    }

    const savedStation = await this.stationRepository.save(station)

    // Send notifications
    if (this.notificationDispatcher) {
      try {
        if (action === "APPROVE") {
          await this.notificationDispatcher.dispatchToStationStakeholders({
            stationId: savedStation.id,
            notifyOwner: true,
            notifyManagers: true,
            defaultPayload: {
              type: "SYSTEM",
              title: "Station Approved! 🎉",
              message: `Station '${savedStation.name}' has been approved and is now live on WashQueue.`,
              data: {
                stationId: savedStation.id,
                stationName: savedStation.name,
                url: "/owner/stations",
              },
              actionType: "NAVIGATE",
            },
          })
        } else if (action === "REJECT") {
          await this.notificationDispatcher.dispatchToStationStakeholders({
            stationId: savedStation.id,
            notifyOwner: true,
            notifyManagers: false,
            defaultPayload: {
              type: "SYSTEM",
              title: "Station Needs Revision",
              message: `Station '${savedStation.name}' was not approved: ${rejectionReason || "Verification issues"}.`,
              data: {
                stationId: savedStation.id,
                stationName: savedStation.name,
                rejectionReason,
                url: "/owner/stations",
              },
              actionType: "NAVIGATE",
            },
          })
        } else if (action === "SUSPEND") {
          await this.notificationDispatcher.dispatchToStationStakeholders({
            stationId: savedStation.id,
            notifyOwner: true,
            notifyManagers: true,
            defaultPayload: {
              type: "SYSTEM",
              title: "Station Suspended",
              message: `Station '${savedStation.name}' has been suspended by administration. Reason: ${rejectionReason || "Policy review"}.`,
              data: {
                stationId: savedStation.id,
                stationName: savedStation.name,
                reason: rejectionReason,
                url: "/owner/stations",
              },
              actionType: "NAVIGATE",
            },
          })
        }
      } catch {
        // Notification failure should not fail review execution
      }
    }

    return savedStation
  }
}
