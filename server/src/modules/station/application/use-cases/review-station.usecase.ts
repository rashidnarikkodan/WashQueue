import { NotFoundError } from "@/common/errors/not-found-error"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { Station } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { IReviewStationUseCase } from "../interfaces/station-usecases.interface"

export class ReviewStationUseCase implements IReviewStationUseCase {
  constructor(private readonly stationRepository: IStationRepository) {}

  async execute(
    stationId: string,
    action: "APPROVE" | "REJECT",
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
    } else {
      throw new AppError("Invalid action type", HTTP_STATUS.BAD_REQUEST)
    }

    await this.stationRepository.save(station)
    return station
  }
}
