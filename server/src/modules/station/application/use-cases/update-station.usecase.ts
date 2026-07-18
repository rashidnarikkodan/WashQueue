import { AppError } from "@/common/errors/app-error"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { Station } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repsoitory"
import { UpdateStationInput } from "../dtos/update-station.dto"
import { IUpdateStationUseCase } from "../interfaces/station-usecases.interface"

export class UpdateStationUseCase implements IUpdateStationUseCase {
  constructor(private readonly stationRepository: IStationRepository) {}

  async execute(stationId: string, ownerId: string, updates: UpdateStationInput): Promise<Station> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    if (station.ownerId !== ownerId) {
      throw new ForbiddenError("You are not authorized to update this station")
    }

    // Do not allow updating status or ownerId directly through the partial update flow
    const { status, ownerId: oid, ...allowedUpdates } = updates as any

    const updatedStation = await this.stationRepository.update(stationId, allowedUpdates)
    if (!updatedStation) {
      throw new NotFoundError("Station not found during update")
    }

    return updatedStation
  }
}
