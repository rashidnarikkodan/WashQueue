import { TimeWindowInstance } from "../../domain/entities/TimeWindowInstance"
import { ITimeWindowDocument } from "../models/time-window.model"
import { Types } from "mongoose"

export class TimeWindowMapper {
  static toDomain(doc: ITimeWindowDocument): TimeWindowInstance {
    return new TimeWindowInstance({
      id: doc._id.toString(),
      stationId: doc.stationId.toString(),
      date: doc.date,
      windowStart: doc.windowStart,
      windowEnd: doc.windowEnd,
      capacityTotal: doc.capacityTotal,
      walkInReservedSlots: doc.walkInReservedSlots,
      advanceBookedCount: doc.advanceBookedCount,
      walkInCount: doc.walkInCount,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }

  static toPersistence(entity: TimeWindowInstance): Partial<ITimeWindowDocument> {
    const props = entity.getProps()
    return {
      stationId: new Types.ObjectId(props.stationId),
      date: props.date,
      windowStart: props.windowStart,
      windowEnd: props.windowEnd,
      capacityTotal: props.capacityTotal,
      walkInReservedSlots: props.walkInReservedSlots,
      advanceBookedCount: props.advanceBookedCount,
      walkInCount: props.walkInCount,
      status: props.status,
    }
  }
}
