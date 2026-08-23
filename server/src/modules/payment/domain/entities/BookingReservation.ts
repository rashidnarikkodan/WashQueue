import { ServiceType, PaymentMethod } from "@/modules/booking/domain/entities/Booking"

export type ReservationStatus = "HELD" | "CONFIRMED" | "RELEASED" | "EXPIRED_REFUND_NEEDED"

export interface BookingReservationProps {
  id: string
  userId: string
  stationId: string
  vehicleId: string
  timeWindowId: string
  serviceType: ServiceType
  extraServiceIds: string[]
  paymentMethod: PaymentMethod
  depositAmount: number
  cashAmount: number
  totalAmount: number
  walletAmount?: number
  paymentOrderId: string
  paymentId?: string
  paymentSignature?: string
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
      walletAmount: props.walletAmount || 0,
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

  get paymentMethod(): PaymentMethod {
    return this.props.paymentMethod
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

  get walletAmount(): number {
    return this.props.walletAmount || 0
  }

  get gatewayOrderId(): string {
    return this.props.paymentOrderId
  }

  get paymentId(): string | undefined {
    return this.props.paymentId
  }

  get paymentSignature(): string | undefined {
    return this.props.paymentSignature
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
    if (paymentId) this.props.paymentId = paymentId
    if (signature) this.props.paymentSignature = signature
    this.props.updatedAt = new Date()
  }

  release(): void {
    this.props.status = "RELEASED"
    this.props.updatedAt = new Date()
  }

  markExpiredRefund(paymentId?: string): void {
    this.props.status = "EXPIRED_REFUND_NEEDED"
    if (paymentId) this.props.paymentId = paymentId
    this.props.updatedAt = new Date()
  }

  toObject(): BookingReservationProps {
    return { ...this.props }
  }
}
