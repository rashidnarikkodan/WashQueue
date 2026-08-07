import { ServiceType, PaymentType } from "./Booking"

export type ReservationStatus = "HELD" | "CONFIRMED" | "RELEASED" | "EXPIRED_REFUND_NEEDED"

export interface BookingReservationProps {
  id: string
  userId: string
  stationId: string
  vehicleId: string
  timeWindowId: string
  serviceType: ServiceType
  extraServiceIds: string[]
  paymentType: PaymentType
  depositAmount: number
  cashAmount: number
  totalAmount: number
  razorpayOrderId: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  bookingId?: string
  status: ReservationStatus
  expiresAt: Date
  createdAt?: Date
  updatedAt?: Date
}

export class BookingReservation {
  private props: BookingReservationProps

  constructor(props: BookingReservationProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    }
  }

  get id(): string {
    return this.props.id
  }

  get userId(): string {
    return this.props.userId
  }

  get stationId(): string {
    return this.props.stationId
  }

  get vehicleId(): string {
    return this.props.vehicleId
  }

  get timeWindowId(): string {
    return this.props.timeWindowId
  }

  get serviceType(): ServiceType {
    return this.props.serviceType
  }

  get extraServiceIds(): string[] {
    return this.props.extraServiceIds
  }

  get paymentType(): PaymentType {
    return this.props.paymentType
  }

  get depositAmount(): number {
    return this.props.depositAmount
  }

  get cashAmount(): number {
    return this.props.cashAmount
  }

  get totalAmount(): number {
    return this.props.totalAmount
  }

  get razorpayOrderId(): string {
    return this.props.razorpayOrderId
  }

  get razorpayPaymentId(): string | undefined {
    return this.props.razorpayPaymentId
  }

  get razorpaySignature(): string | undefined {
    return this.props.razorpaySignature
  }

  get bookingId(): string | undefined {
    return this.props.bookingId
  }

  get status(): ReservationStatus {
    return this.props.status
  }

  get expiresAt(): Date {
    return this.props.expiresAt
  }

  get createdAt(): Date {
    return this.props.createdAt!
  }

  get updatedAt(): Date {
    return this.props.updatedAt!
  }

  get isExpired(): boolean {
    return new Date() > this.props.expiresAt
  }

  get isHeld(): boolean {
    return this.props.status === "HELD"
  }

  confirm(bookingId: string, paymentId?: string, signature?: string): void {
    this.props.status = "CONFIRMED"
    this.props.bookingId = bookingId
    if (paymentId) this.props.razorpayPaymentId = paymentId
    if (signature) this.props.razorpaySignature = signature
    this.props.updatedAt = new Date()
  }

  release(): void {
    this.props.status = "RELEASED"
    this.props.updatedAt = new Date()
  }

  markExpiredRefund(paymentId?: string): void {
    this.props.status = "EXPIRED_REFUND_NEEDED"
    if (paymentId) this.props.razorpayPaymentId = paymentId
    this.props.updatedAt = new Date()
  }

  toObject(): BookingReservationProps {
    return { ...this.props }
  }
}
