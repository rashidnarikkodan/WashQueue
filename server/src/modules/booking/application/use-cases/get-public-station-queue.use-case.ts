import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IBookingQueueService } from "../interfaces/booking-queue.interface"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"

export interface PublicQueueItemDTO {
  id: string
  bookingNumber: string
  position?: number
  bayNumber?: number
  vehicle: string
  package: string
  serviceType: string
  status: string
  serviceStartedAt?: string
  estimatedWaitMinutes?: number
  estimatedServiceStart?: string
  isBayActive: boolean
}

export interface PublicStationQueueDTO {
  stationId: string
  stationName: string
  totalBays: number
  activeServicesCount: number
  availableBays: number
  queueDepth: number
  totalActiveAndWaiting: number
  averageWashDurationMinutes: number
  activeServices: PublicQueueItemDTO[]
  waitingQueue: PublicQueueItemDTO[]
}

export class GetPublicStationQueueUseCase {
  constructor(
    private readonly redisQueueService: IBookingQueueService,
    private readonly stationRepository: IStationRepository
  ) {}

  async execute(stationId: string): Promise<PublicStationQueueDTO> {
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }

    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new AppError("Station not found", HTTP_STATUS.NOT_FOUND)
    }

    const totalBays = station.getProps().slotConfig?.bays || 1

    let queueData = await this.redisQueueService.getOperationalQueue(stationId, totalBays)
    if (!queueData) {
      queueData = await this.redisQueueService.reconcileStationQueue(stationId)
    }

    // Format active in-bay wash items
    const activeServices: PublicQueueItemDTO[] = (queueData.activeServices || []).map((item, idx) => ({
      id: item.bookingId,
      bookingNumber: item.bookingNumber,
      bayNumber: item.assignedBayNumber || (idx % totalBays) + 1,
      vehicle: item.vehicleModel || "Vehicle",
      package: item.serviceType === "FULL" ? "Complete Full Wash" : "Express Half Wash",
      serviceType: item.serviceType,
      status: item.status === "SERVICE_COMPLETED" ? "Finishing Up" : "Washing",
      serviceStartedAt: item.serviceStartedAt,
      isBayActive: true,
    }))

    // Format waiting queue items
    const waitingQueue: PublicQueueItemDTO[] = (queueData.waitingQueue || []).map((item) => ({
      id: item.bookingId,
      bookingNumber: item.bookingNumber,
      position: item.queuePosition,
      vehicle: item.vehicleModel || "Vehicle",
      package: item.serviceType === "FULL" ? "Complete Full Wash" : "Express Half Wash",
      serviceType: item.serviceType,
      status: "Waiting",
      estimatedWaitMinutes: item.estimatedWaitMinutes,
      estimatedServiceStart: item.estimatedServiceStart,
      isBayActive: false,
    }))

    return {
      stationId,
      stationName: queueData.stationName,
      totalBays: queueData.totalBays,
      activeServicesCount: queueData.activeServicesCount,
      availableBays: queueData.availableBays,
      queueDepth: queueData.queueDepth,
      totalActiveAndWaiting: queueData.totalActiveAndWaiting,
      averageWashDurationMinutes: queueData.averageWashDurationMinutes,
      activeServices,
      waitingQueue,
    }
  }
}
