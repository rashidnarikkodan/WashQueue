import { IMapper } from "@/core/domain/repository.interface"
import { Settlement } from "../../domain/entities/Settlement"
import { ISettlementDocument } from "../models/settlement.model"

export class SettlementMapper implements IMapper<Settlement, ISettlementDocument> {
  toDomain(doc: ISettlementDocument): Settlement {
    return new Settlement({
      id: doc._id.toString(),
      bookingId: doc.bookingId,
      ownerId: doc.ownerId,
      stationSettlementAmount: doc.stationSettlementAmount,
      platformCommission: doc.platformCommission,
      status: doc.status,
      createdAt: doc.createdAt,
      totalAmount: doc.totalAmount,
    })
  }
  toPersistence(entity: Settlement): Partial<ISettlementDocument> {
    const props = entity.getProps()
    return {
      bookingId: props.bookingId,
      ownerId: props.ownerId,
      totalAmount: props.totalAmount,
      platformCommission: props.platformCommission,
      stationSettlementAmount: props.stationSettlementAmount,
      status: props.status,
      createdAt: props.createdAt,
      settledAt: props.settledAt,
    }
  }
}
