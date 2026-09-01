import { IMapper } from "@/core/domain/repository.interface"
import { Settlement } from "../../domain/entities/Settlement"
import { ISettlementDocument } from "../models/settlement.model"

export class SettlementMapper implements IMapper<Settlement, ISettlementDocument> {
  toDomain(doc: ISettlementDocument): Settlement {
    return new Settlement({
      id: doc._id.toString(),
      bookingId: doc.bookingId,
      ownerId: doc.ownerId,
      stationId: doc.stationId,
      totalAmount: doc.totalAmount,
      platformCommission: doc.platformCommission,
      platformCommissionRate: doc.platformCommissionRate,
      stationSettlementAmount: doc.stationSettlementAmount,
      currency: doc.currency || "INR",
      status: doc.status,
      transferId: doc.transferId,
      holdReason: doc.holdReason,
      failureReason: doc.failureReason,
      retryCount: doc.retryCount || 0,
      lastRetriedAt: doc.lastRetriedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      settledAt: doc.settledAt,
    })
  }

  toPersistence(entity: Settlement): Partial<ISettlementDocument> {
    const props = entity.getProps()
    return {
      bookingId: props.bookingId,
      ownerId: props.ownerId,
      stationId: props.stationId,
      totalAmount: props.totalAmount,
      platformCommission: props.platformCommission,
      platformCommissionRate: props.platformCommissionRate,
      stationSettlementAmount: props.stationSettlementAmount,
      currency: props.currency || "INR",
      status: props.status,
      transferId: props.transferId,
      holdReason: props.holdReason,
      failureReason: props.failureReason,
      retryCount: props.retryCount,
      lastRetriedAt: props.lastRetriedAt,
      createdAt: props.createdAt,
      settledAt: props.settledAt,
    }
  }
}
