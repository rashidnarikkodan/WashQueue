import { SlotConfig } from "../../domain/entities/SlotConfig"
import { ISlotConfigDocument } from "../models/slot-config.model"
import { Types } from "mongoose"

export class SlotConfigMapper {
  static toDomain(doc: ISlotConfigDocument): SlotConfig {
    return new SlotConfig({
      id: doc._id.toString(),
      stationId: doc.stationId.toString(),
      windowDurationMins: doc.windowDurationMins,
      capacityPerWindow: doc.capacityPerWindow,
      walkInReservedSlots: doc.walkInReservedSlots,
      maxAdvanceBookingDays: doc.maxAdvanceBookingDays,
      allowWalkIns: doc.allowWalkIns,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }

  static toPersistence(entity: SlotConfig): Partial<ISlotConfigDocument> {
    const props = entity.getProps()
    return {
      stationId: new Types.ObjectId(props.stationId),
      windowDurationMins: props.windowDurationMins,
      capacityPerWindow: props.capacityPerWindow,
      walkInReservedSlots: props.walkInReservedSlots,
      maxAdvanceBookingDays: props.maxAdvanceBookingDays,
      allowWalkIns: props.allowWalkIns,
    }
  }
}
