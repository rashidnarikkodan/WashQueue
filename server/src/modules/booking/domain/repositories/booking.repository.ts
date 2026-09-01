import { Booking, BookingStatus, PaymentStatus } from "../entities/Booking"

export interface FindUserBookingsFilter {
  userId: string
  status?: BookingStatus | BookingStatus[]
  upcomingOnly?: boolean
  historyOnly?: boolean
  noShowOnly?: boolean
}

export interface FindBookingsFilter {
  userId?: string
  stationId?: string
  stationIds?: string[]
  ownerId?: string
  status?: BookingStatus | BookingStatus[] | string
  search?: string
  startDate?: Date | string
  endDate?: Date | string
  page?: number
  limit?: number
  upcomingOnly?: boolean
  historyOnly?: boolean
  noShowOnly?: boolean
}

export interface FindBookingsResult {
  bookings: Booking[]
  total: number
}

export interface RefundDetailsSnapshot {
  refundType: string
  refundMethod: string
  status: "PROCESSED" | "NONE"
  amount: number
  reason: string
  transactionId: string | null
}

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>
  findByBookingNumber(bookingNumber: string): Promise<Booking | null>
  findByQrTokenHash(qrTokenHash: string): Promise<Booking | null>
  findByUserId(filter: FindUserBookingsFilter): Promise<Booking[]>
  findByStationId(stationId: string, status?: BookingStatus): Promise<Booking[]>
  findBookings(filter: FindBookingsFilter): Promise<FindBookingsResult>
  save(booking: Booking, session?: unknown): Promise<Booking>
  update(booking: Booking): Promise<Booking>

  updateWithStatusGuard(
    booking: Booking,
    expectedCurrentStatus: BookingStatus | BookingStatus[],
    session?: unknown
  ): Promise<Booking | null>

  countByStationAndStatus(stationId: string, status: BookingStatus): Promise<number>

  findNoShowCandidates(graceCutoff: Date): Promise<Booking[]>

  getRefundDetails(bookingId: string): Promise<RefundDetailsSnapshot | null>

  applyRefund(
    bookingId: string,
    refund: RefundDetailsSnapshot,
    newPaymentStatus: PaymentStatus
  ): Promise<Booking | null>
}
