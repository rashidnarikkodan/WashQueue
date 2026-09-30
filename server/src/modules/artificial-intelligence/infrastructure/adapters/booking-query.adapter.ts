import { IBookingRepository } from "@/modules/booking/domain/repositories/booking.repository"
import { Booking } from "@/modules/booking/domain/entities/Booking"
import { BookingSummary, IBookingQueryPort } from "../../application/ports/booking-query.port"

export class BookingQueryAdapter implements IBookingQueryPort {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  private mapToSummary(booking: Booking): BookingSummary {
    const props = booking.getProps()
    const vehicleInfo = props.vehicleDetails
      ? [
          props.vehicleDetails.brand,
          props.vehicleDetails.model,
          props.vehicleDetails.registrationNumber,
        ]
          .filter(Boolean)
          .join(" ")
      : undefined

    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      stationName: props.stationDetails?.name,
      scheduledStart: props.scheduling?.windowStart,
      scheduledEnd: props.scheduling?.windowEnd,
      vehicleInfo: vehicleInfo || "Registered vehicle",
      serviceType: booking.serviceType,
      paymentStatus: booking.paymentStatus,
      depositAmount: booking.depositAmount,
      totalPrice: props.pricingSnapshot?.totalPrice,
    }
  }

  async getUserBookings(userId: string, limit: number = 5): Promise<BookingSummary[]> {
    if (!userId || !userId.trim()) return []

    const bookings = await this.bookingRepository.findByUserId({
      userId: userId.trim(),
    })

    // Sort by scheduledStart or createdAt descending
    bookings.sort((a, b) => {
      const aTime = a.getProps().scheduling?.windowStart?.getTime() ?? a.createdAt.getTime()
      const bTime = b.getProps().scheduling?.windowStart?.getTime() ?? b.createdAt.getTime()
      return bTime - aTime
    })

    return bookings.slice(0, limit).map((b) => this.mapToSummary(b))
  }

  async getBookingByNumber(bookingNumber: string, userId: string): Promise<BookingSummary | null> {
    if (!bookingNumber || !userId) return null

    const cleanNum = bookingNumber.trim().toUpperCase()
    const booking = await this.bookingRepository.findByBookingNumber(cleanNum)
    if (!booking) {
      return null
    }

    // STRICT USER SECURITY GUARD: Ensure booking belongs to this user
    if (booking.userId !== userId.trim()) {
      return null
    }

    return this.mapToSummary(booking)
  }
}
