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
  providerId?: string
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

// refundDetails is a persistence-only audit record (no domain behavior hangs off it),
// so it's modeled as a plain value object at the repository boundary rather than on Booking.
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

  /**
   * Persists `booking` only if its current stored status still matches
   * `expectedCurrentStatus` — the optimistic-concurrency guard every state-transition
   * use case needs to avoid double-processing a booking two managers act on at once.
   * Returns null when the guard fails (someone else already moved it).
   */
  updateWithStatusGuard(
    booking: Booking,
    expectedCurrentStatus: BookingStatus | BookingStatus[],
    session?: unknown
  ): Promise<Booking | null>

  countByStationAndStatus(stationId: string, status: BookingStatus): Promise<number>

  /** CONFIRMED bookings whose time window ended before `graceCutoff` and haven't been processed yet. */
  findNoShowCandidates(graceCutoff: Date): Promise<Booking[]>

  getRefundDetails(bookingId: string): Promise<RefundDetailsSnapshot | null>

  /** Atomically locks in a refund (no-op if already PROCESSED) and updates payment status. */
  applyRefund(
    bookingId: string,
    refund: RefundDetailsSnapshot,
    newPaymentStatus: PaymentStatus
  ): Promise<Booking | null>
}

