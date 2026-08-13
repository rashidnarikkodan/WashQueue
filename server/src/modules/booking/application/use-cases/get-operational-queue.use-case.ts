import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { OperationalStationQueueDTO } from "../dtos/operational-queue.dto"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"

export class GetOperationalQueueUseCase {
  constructor(
    private readonly redisQueueService: IBookingQueueService,
    private readonly stationRepository: IStationRepository
  ) {}

  async execute(stationId: string): Promise<OperationalStationQueueDTO> {
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new AppError("Station not found", HTTP_STATUS.NOT_FOUND)
    }

    const totalBays = station.getProps().slotConfig?.bays || 1

    const result = await this.redisQueueService.getOperationalQueue(stationId, totalBays)
    if (!result) {
      return await this.redisQueueService.reconcileStationQueue(stationId)
    }

    return result
  }
}
