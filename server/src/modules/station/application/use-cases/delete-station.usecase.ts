import { AppError } from "@/common/errors/app-error"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { StationStatus } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { IStationPricingRepository } from "../../domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "../../domain/repositories/extra-service.repository"
import { IDeleteStationUseCase } from "../interfaces/station-usecases.interface"
import { ITransactionRunner } from "@/core/domain/transaction.interface"

export class DeleteStationUseCase implements IDeleteStationUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository,
    private readonly transactionRunner?: ITransactionRunner
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

    const runDelete = async (session?: unknown) => {
      await this.stationPricingRepository.deleteByStationId(stationId, session)
      await this.extraServiceRepository.deleteByStationId(stationId, session)
      await this.stationRepository.delete(stationId)
    }

    if (this.transactionRunner) {
      await this.transactionRunner.runInTransaction(runDelete)
    } else {
      await runDelete()
    }
  }
}
