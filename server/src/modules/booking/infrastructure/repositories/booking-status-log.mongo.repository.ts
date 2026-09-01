import { Types, ClientSession } from "mongoose"
import { BookingStatusLog } from "../../domain/entities/BookingStatusLog"
import { IBookingStatusLogRepository } from "../../domain/repositories/booking-status-log.repository"
import { BookingStatusLogModel } from "../models/booking-status-log.model"
import { BookingStatusLogMapper } from "../mappers/booking-status-log.mapper"

export class BookingStatusLogMongoRepository implements IBookingStatusLogRepository {
  async save(log: BookingStatusLog, session?: unknown): Promise<BookingStatusLog> {
    const raw = BookingStatusLogMapper.toPersistence(log)
    const doc = (
      await BookingStatusLogModel.create([raw], { session: session as ClientSession })
    )[0]!
    return BookingStatusLogMapper.toDomain(doc)
  }

  async findByBookingId(bookingId: string): Promise<BookingStatusLog[]> {
    if (!Types.ObjectId.isValid(bookingId)) return []
    const docs = await BookingStatusLogModel.find({
      bookingId: new Types.ObjectId(bookingId),
    }).sort({
      createdAt: 1,
    })
    return docs.map(BookingStatusLogMapper.toDomain)
  }
}
