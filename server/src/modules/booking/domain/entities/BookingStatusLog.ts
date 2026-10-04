import { BookingStatus } from "./Booking"

import { BookingStatusLogProps } from "../types/booking.types"

export class BookingStatusLog {
  constructor(private readonly props: BookingStatusLogProps) {}

  get id(): string {
    return this.props.id
  }

  get bookingId(): string {
    return this.props.bookingId
  }

  get fromStatus(): BookingStatus | null {
    return this.props.fromStatus
  }

  get toStatus(): BookingStatus {
    return this.props.toStatus
  }

  get changedBy(): string {
    return this.props.changedBy
  }

  get reason(): string | undefined {
    return this.props.reason
  }

  get notes(): string | undefined {
    return this.props.notes
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  getProps(): BookingStatusLogProps {
    return { ...this.props }
  }
}
