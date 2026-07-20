import mongoose from "mongoose"
import { AppError } from "@/common/errors/app-error"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { StationStatus } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { IStationPricingRepository } from "../../domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "../../domain/repositories/extra-service.repository"
import { IDeleteStationUseCase } from "../interfaces/station-usecases.interface"

export class DeleteStationUseCase implements IDeleteStationUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository
  ) {}

  async execute(stationId: string, ownerId: string): Promise<void> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    if (station.ownerId !== ownerId) {
      throw new ForbiddenError("You are not authorized to delete this station")
    }

    const deletableStatuses = [StationStatus.DRAFT, StationStatus.REJECTED]
    if (!deletableStatuses.includes(station.status)) {
      throw new AppError(
        "Only draft or rejected stations can be deleted",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const session = await mongoose.startSession()

    try {
      await session.withTransaction(async () => {
        await this.stationPricingRepository.deleteByStationId(stationId, session)
        await this.extraServiceRepository.deleteByStationId(stationId, session)
        await this.stationRepository.delete(stationId)
      })
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error
      }
      const message = error instanceof Error ? error.message : "Failed to delete station"
      throw new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    } finally {
      await session.endSession()
    }
  }
}
