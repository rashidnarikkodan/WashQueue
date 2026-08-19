import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { OperationalStationQueueDTO } from "../dtos/operational-queue.dto"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"

export class GetOperationalQueueUseCase {
  constructor(
    private readonly redisQueueService: IBookingQueueService,
    private readonly stationRepository: IStationRepository,
    private readonly managerAssignmentRepository: IManagerAssignmentRepository
  ) {}

  async execute(managerUserId: string, stationId: string): Promise<OperationalStationQueueDTO> {
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new AppError("Station not found", HTTP_STATUS.NOT_FOUND)
    }

    const isOwner = station.ownerId === managerUserId
    let isAuthorizedManager = isOwner

    if (!isAuthorizedManager) {
      const assignment = await this.managerAssignmentRepository.findByUserAndStation(
        managerUserId,
        stationId
      )
      if (assignment && assignment.status === "ACTIVE") {
        isAuthorizedManager = true
      }
    }

    if (!isAuthorizedManager) {
      throw new AppError(
        "You are not authorized to view the operational queue for this station",
        HTTP_STATUS.FORBIDDEN
      )
    }

    const totalBays = station.getProps().slotConfig?.bays || 1

    const result = await this.redisQueueService.getOperationalQueue(stationId, totalBays)
    if (!result) {
      return await this.redisQueueService.reconcileStationQueue(stationId)
    }

    return result
  }
}
