import {
  OperationalQueueItemDTO,
  OperationalStationQueueDTO,
} from "../dtos/operational-queue.dto"
import { PublicStationQueueDTO } from "../dtos/queue-operations.dto"

export class QueueDTOMapper {
  static toOperationalQueueItemDTO(item: OperationalQueueItemDTO): OperationalQueueItemDTO {
    return {
      bookingId: item.bookingId,
      bookingNumber: item.bookingNumber,
      stationId: item.stationId,
      status: item.status,
      serviceType: item.serviceType,
      isWalkIn: item.isWalkIn,
      customerName: item.customerName,
      customerPhone: item.customerPhone,
      registrationNumber: item.registrationNumber,
      vehicleModel: item.vehicleModel,
      windowStart: item.windowStart,
      windowEnd: item.windowEnd,
      checkedInAt: item.checkedInAt,
      serviceStartedAt: item.serviceStartedAt,
      completedAt: item.completedAt,
      queuePosition: item.queuePosition,
      isBayActive: item.isBayActive,
      assignedBayNumber: item.assignedBayNumber,
      estimatedWaitMinutes: item.estimatedWaitMinutes,
      estimatedServiceStart: item.estimatedServiceStart,
      stalledReason: item.stalledReason,
    }
  }

  static toOperationalStationQueueDTO(
    queue: OperationalStationQueueDTO
  ): OperationalStationQueueDTO {
    return {
      stationId: queue.stationId,
      stationName: queue.stationName,
      totalBays: queue.totalBays,
      activeServicesCount: queue.activeServicesCount,
      availableBays: queue.availableBays,
      queueDepth: queue.queueDepth,
      totalActiveAndWaiting: queue.totalActiveAndWaiting,
      averageWashDurationMinutes: queue.averageWashDurationMinutes,
      waitingQueue: (queue.waitingQueue || []).map((item) =>
        QueueDTOMapper.toOperationalQueueItemDTO(item)
      ),
      activeServices: (queue.activeServices || []).map((item) =>
        QueueDTOMapper.toOperationalQueueItemDTO(item)
      ),
      reconciledWithMongo: queue.reconciledWithMongo,
    }
  }

  static toPublicQueueDTO(queue: PublicStationQueueDTO): PublicStationQueueDTO {
    return {
      stationId: queue.stationId,
      stationName: queue.stationName,
      totalBays: queue.totalBays,
      activeServicesCount: queue.activeServicesCount,
      availableBays: queue.availableBays,
      queueDepth: queue.queueDepth,
      totalActiveAndWaiting: queue.totalActiveAndWaiting,
      averageWashDurationMinutes: queue.averageWashDurationMinutes,
      activeServices: (queue.activeServices || []).map((item) => ({
        id: item.id,
        bookingNumber: item.bookingNumber,
        bayNumber: item.bayNumber,
        vehicle: item.vehicle,
        package: item.package,
        serviceType: item.serviceType,
        status: item.status,
        serviceStartedAt: item.serviceStartedAt,
        isBayActive: item.isBayActive,
      })),
      waitingQueue: (queue.waitingQueue || []).map((item) => ({
        id: item.id,
        bookingNumber: item.bookingNumber,
        position: item.position,
        vehicle: item.vehicle,
        package: item.package,
        serviceType: item.serviceType,
        status: item.status,
        estimatedWaitMinutes: item.estimatedWaitMinutes,
        estimatedServiceStart: item.estimatedServiceStart,
        isBayActive: item.isBayActive,
      })),
    }
  }
}
