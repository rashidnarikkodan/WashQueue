import { Types } from "mongoose"
import { BookingStatus } from "../../domain/entities/Booking"
import { BookingStatusLog, BookingStatusLogProps } from "../../domain/entities/BookingStatusLog"
import { IBookingStatusLogDocument } from "../models/booking-status-log.model"

function toObjectId(val: unknown): Types.ObjectId | null {
  if (!val) return null
  const str = String(val).trim()
  if (!str) return null
  return Types.ObjectId.isValid(str) ? new Types.ObjectId(str) : null
}

export class BookingStatusLogMapper {
  static toDomain(doc: IBookingStatusLogDocument): BookingStatusLog {
    const props: BookingStatusLogProps = {
      id: doc._id.toString(),
      bookingId: doc.bookingId ? doc.bookingId.toString() : "",
      fromStatus: (doc.fromStatus as BookingStatus) || null,
      toStatus: doc.toStatus as BookingStatus,
      changedBy: doc.changedBy ? doc.changedBy.toString() : "",
      reason: doc.reason,
      notes: doc.notes,
      createdAt: doc.createdAt,
    }

    return new BookingStatusLog(props)
  }

  static toPersistence(entity: BookingStatusLog): Partial<IBookingStatusLogDocument> {
    const props = entity.getProps()
    return {
      bookingId: toObjectId(props.bookingId) || new Types.ObjectId(),
      fromStatus: props.fromStatus,
      toStatus: props.toStatus,
      changedBy: toObjectId(props.changedBy) || new Types.ObjectId(),
      reason: props.reason,
      notes: props.notes,
    }
  }
}
