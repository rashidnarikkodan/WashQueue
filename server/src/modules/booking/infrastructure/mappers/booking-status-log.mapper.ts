import { Types } from "mongoose"
import { BookingStatus } from "../../domain/entities/Booking"
import { BookingStatusLog, BookingStatusLogProps } from "../../domain/entities/BookingStatusLog"
import { IBookingStatusLogDocument } from "../models/booking-status-log.model"

export class BookingStatusLogMapper {
  static toDomain(doc: IBookingStatusLogDocument): BookingStatusLog {
    const props: BookingStatusLogProps = {
      id: doc._id.toString(),
      bookingId: doc.bookingId.toString(),
      fromStatus: (doc.fromStatus as BookingStatus) || null,
      toStatus: doc.toStatus as BookingStatus,
      changedBy: doc.changedBy.toString(),
      reason: doc.reason,
      notes: doc.notes,
      createdAt: doc.createdAt,
    }

    return new BookingStatusLog(props)
  }

  static toPersistence(entity: BookingStatusLog): Partial<IBookingStatusLogDocument> {
    const props = entity.getProps()
    return {
      bookingId: new Types.ObjectId(props.bookingId),
      fromStatus: props.fromStatus,
      toStatus: props.toStatus,
      changedBy: new Types.ObjectId(props.changedBy),
      reason: props.reason,
      notes: props.notes,
    }
  }
}
