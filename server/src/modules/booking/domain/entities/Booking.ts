import { BookingStatus, ServiceType } from "@/common/constants/booking.constants"
import { PaymentStatus, PaymentMethod } from "@/common/constants/payment.constants"

export { BookingStatus, ServiceType, PaymentStatus, PaymentMethod }

// Called once the caller already knows the payment is an online settlement (as opposed to
// PAY_AT_STATION/NO_PAYMENT) — picks the exact instrument based on wallet usage.
export function deriveOnlinePaymentMethod(
  opts: { isWalletPayment?: boolean; walletAmount?: number } = {}
): PaymentMethod {
  if (opts.isWalletPayment) return PaymentMethod.WALLET
  if (opts.walletAmount && opts.walletAmount > 0) return PaymentMethod.WALLET_AND_ONLINE
  return PaymentMethod.ONLINE
}

// Single source of truth for whether a booking's payment is considered settled at creation.
// PAY_AT_STATION always defers to the station: settled immediately for a walk-in (cash handed
// over on the spot) but left PENDING for a pre-booked slot (cash due later at check-in).
export function derivePaymentStatus(paymentMethod: PaymentMethod, isWalkIn: boolean): PaymentStatus {
  if (paymentMethod === PaymentMethod.PAY_AT_STATION) {
    return isWalkIn ? PaymentStatus.PAID : PaymentStatus.PENDING
  }
  return PaymentStatus.PAID
}

export interface VehicleSnapshot {
  vehicleCategoryId: string
  vehicleClassId: string
}

export interface PricingSnapshot {
  basePrice: number
  extraPrice: number
  totalPrice: number
  currency: string
}

export interface ExtraServiceSnapshot {
  serviceId: string
  name: string
  price: number
}

export interface SchedulingDetails {
  timeWindowId: string
  windowStart: Date
  windowEnd: Date
}

export interface WalkInCustomer {
  userId?: string
  name: string
  phone: string
}

export interface WalkInVehicle {
  vehicleId?: string
  registrationNumber: string
  categoryId: string
  classId: string
}

export interface InspectionRecord {
  photos: string[]
  notes?: string
  capturedBy: string
  capturedAt: Date
}

export interface SettlementSnapshot {
  platformCommission: number
  stationSettlement: number
}

export interface QRDetails {
  qrTokenHash: string
  qrExpiresAt: Date
}

export interface CancellationDetails {
  cancellationReason: string
  cancelledBy: string
  cancelledAt: Date
}

export interface StationDetails {
  name?: string
  city?: string
  phone?: string
}

export interface VehicleDetails {
  nickname?: string
  brand?: string
  model?: string
  registrationNumber?: string
}

export interface CustomerDetails {
  name?: string
  email?: string
  phone?: string
}

export interface StalledDetails {
  stalledReason: string
  stalledBy: string
  stalledAt: Date
  previousStatus: "CHECKED_IN" | "IN_SERVICE"
  resolution?: string
  resolvedBy?: string
  resolvedAt?: Date
}

export interface BookingProps {
  id: string
  bookingNumber: string
  userId?: string | null
  providerId: string
  stationId: string
  vehicleId?: string | null
  vehicleSnapshot: VehicleSnapshot
  serviceType: ServiceType
  pricingSnapshot: PricingSnapshot
  extraServices: ExtraServiceSnapshot[]
  scheduling: SchedulingDetails
  isWalkIn: boolean
  walkInCustomer?: WalkInCustomer | null
  walkInVehicle?: WalkInVehicle | null
  createdByUserId: string
  qr: QRDetails
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  depositAmount: number
  cashAmount: number
  refundAmount: number
  settlement: SettlementSnapshot
  preServiceInspection?: InspectionRecord | null
  postServiceInspection?: InspectionRecord | null
  status: BookingStatus
  stalledInfo?: StalledDetails | null
  checkedInAt?: Date | null
  checkedInBy?: string | null
  serviceStartedAt?: Date | null
  serviceCompletedAt?: Date | null
  handoverInitiatedAt?: Date | null
  completedAt?: Date | null
  noShowAt?: Date | null
  cancellation?: CancellationDetails | null
  stationDetails?: StationDetails
  vehicleDetails?: VehicleDetails
  customerDetails?: CustomerDetails
  rescheduleCount?: number
  createdAt: Date
  updatedAt: Date
}

export class Booking {
  constructor(private readonly props: BookingProps) { }

  get id(): string {
    return this.props.id
  }

  get bookingNumber(): string {
    return this.props.bookingNumber
  }

  get userId(): string | null | undefined {
    return this.props.userId
  }

  get providerId(): string {
    return this.props.providerId
  }

  get stationId(): string {
    return this.props.stationId
  }

  get vehicleId(): string | null | undefined {
    return this.props.vehicleId
  }

  get vehicleSnapshot(): VehicleSnapshot {
    return this.props.vehicleSnapshot
  }

  get serviceType(): ServiceType {
    return this.props.serviceType
  }

  get pricingSnapshot(): PricingSnapshot {
    return this.props.pricingSnapshot
  }

  get extraServices(): ExtraServiceSnapshot[] {
    return this.props.extraServices
  }

  get scheduling(): SchedulingDetails {
    return this.props.scheduling
  }

  get isWalkIn(): boolean {
    return this.props.isWalkIn
  }

  get walkInCustomer(): WalkInCustomer | null | undefined {
    return this.props.walkInCustomer
  }

  get walkInVehicle(): WalkInVehicle | null | undefined {
    return this.props.walkInVehicle
  }

  get createdByUserId(): string {
    return this.props.createdByUserId
  }

  get qr(): QRDetails {
    return this.props.qr
  }

  get paymentStatus(): PaymentStatus {
    return this.props.paymentStatus
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

  get refundAmount(): number {
    return this.props.refundAmount
  }

  get settlement(): SettlementSnapshot {
    return this.props.settlement
  }

  get preServiceInspection(): InspectionRecord | null | undefined {
    return this.props.preServiceInspection
  }

  get postServiceInspection(): InspectionRecord | null | undefined {
    return this.props.postServiceInspection
  }

  get status(): BookingStatus {
    return this.props.status
  }

  get stalledInfo(): StalledDetails | null | undefined {
    return this.props.stalledInfo
  }

  get checkedInAt(): Date | null | undefined {
    return this.props.checkedInAt
  }

  get checkedInBy(): string | null | undefined {
    return this.props.checkedInBy
  }

  get serviceStartedAt(): Date | null | undefined {
    return this.props.serviceStartedAt
  }

  get serviceCompletedAt(): Date | null | undefined {
    return this.props.serviceCompletedAt
  }

  get handoverInitiatedAt(): Date | null | undefined {
    return this.props.handoverInitiatedAt
  }

  get completedAt(): Date | null | undefined {
    return this.props.completedAt
  }

  get noShowAt(): Date | null | undefined {
    return this.props.noShowAt
  }

  get cancellation(): CancellationDetails | null | undefined {
    return this.props.cancellation
  }

  get stationDetails(): StationDetails | undefined {
    return this.props.stationDetails
  }

  get vehicleDetails(): VehicleDetails | undefined {
    return this.props.vehicleDetails
  }

  get customerDetails(): CustomerDetails | undefined {
    return this.props.customerDetails
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  get rescheduleCount(): number {
    return this.props.rescheduleCount ?? 0
  }

  getProps(): BookingProps {
    return { ...this.props }
  }

  canTransitionTo(targetStatus: BookingStatus): boolean {
    const current = this.props.status

    switch (current) {
      case BookingStatus.PENDING:
        return [BookingStatus.CONFIRMED, BookingStatus.CANCELLED].includes(targetStatus)
      case BookingStatus.CONFIRMED:
        return [BookingStatus.CHECKED_IN, BookingStatus.CANCELLED, BookingStatus.NO_SHOW].includes(
          targetStatus
        )
      case BookingStatus.CHECKED_IN:
        return [BookingStatus.IN_SERVICE, BookingStatus.CANCELLED, BookingStatus.NO_SHOW].includes(
          targetStatus
        )
      case BookingStatus.IN_SERVICE:
        return [
          BookingStatus.SERVICE_COMPLETED,
          BookingStatus.AWAITING_HANDOVER,
          BookingStatus.COMPLETED,
          BookingStatus.CANCELLED,
        ].includes(targetStatus)
      case BookingStatus.SERVICE_COMPLETED:
        return [BookingStatus.AWAITING_HANDOVER, BookingStatus.COMPLETED].includes(targetStatus)
      case BookingStatus.AWAITING_HANDOVER:
        return [BookingStatus.COMPLETED].includes(targetStatus)
      case BookingStatus.COMPLETED:
      case BookingStatus.CANCELLED:
      case BookingStatus.NO_SHOW:
        return false
      default:
        return false
    }
  }

  canReschedule(now: Date = new Date()): boolean {
    const allowedStatuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED]
    if (!allowedStatuses.includes(this.props.status)) {
      return false
    }

    // Disallow walk-in bookings if applicable
    if (this.props.isWalkIn) {
      return false
    }

    // Max 2 reschedules permitted
    if ((this.props.rescheduleCount ?? 0) >= 2) {
      return false
    }

    const windowStartMs = new Date(this.props.scheduling.windowStart).getTime()
    const nowMs = now.getTime()
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

    return (windowStartMs - nowMs) >= TWENTY_FOUR_HOURS_MS
  }

  reschedule(newScheduling: SchedulingDetails, now: Date = new Date()): void {
    if (!this.canReschedule(now)) {
      if ((this.props.rescheduleCount ?? 0) >= 2) {
        throw new Error(
          "Cannot reschedule booking: Maximum limit of 2 reschedules has been reached."
        )
      }
      throw new Error(
        `Cannot reschedule booking: Rescheduling is only allowed at least 24 hours prior to the scheduled window start for PENDING or CONFIRMED bookings.`
      )
    }

    this.props.rescheduleCount = (this.props.rescheduleCount ?? 0) + 1
    this.props.scheduling = newScheduling
    if (this.props.qr) {
      this.props.qr.qrExpiresAt = new Date(
        new Date(newScheduling.windowEnd).getTime() + 24 * 60 * 60 * 1000
      )
    }
    this.props.updatedAt = now
  }


  checkIn(byUserId: string): void {
    if (!this.canTransitionTo(BookingStatus.CHECKED_IN)) {
      throw new Error(`Cannot check in booking in status ${this.props.status}`)
    }
    const now = new Date()
    this.props.status = BookingStatus.CHECKED_IN
    this.props.checkedInAt = now
    this.props.checkedInBy = byUserId
    this.props.updatedAt = now
  }

  completePreInspection(inspection: InspectionRecord, byUserId: string): void {
    if (!this.canTransitionTo(BookingStatus.CHECKED_IN)) {
      throw new Error(`Cannot complete pre-service inspection for booking in status ${this.props.status}`)
    }
    const now = new Date()
    this.props.status = BookingStatus.CHECKED_IN
    this.props.checkedInAt = now
    this.props.checkedInBy = byUserId
    this.props.preServiceInspection = inspection
    this.props.updatedAt = now
  }

  startService(): void {
    if (!this.canTransitionTo(BookingStatus.IN_SERVICE)) {
      throw new Error(`Cannot start service for booking in status ${this.props.status}`)
    }
    const now = new Date()
    this.props.status = BookingStatus.IN_SERVICE
    this.props.serviceStartedAt = now
    this.props.updatedAt = now
  }

  completeService(): void {
    if (!this.canTransitionTo(BookingStatus.SERVICE_COMPLETED)) {
      throw new Error(`Cannot complete service for booking in status ${this.props.status}`)
    }
    const now = new Date()
    this.props.status = BookingStatus.SERVICE_COMPLETED
    this.props.serviceCompletedAt = now
    this.props.updatedAt = now
  }

  initiateHandover(): void {
    if (!this.canTransitionTo(BookingStatus.AWAITING_HANDOVER)) {
      throw new Error(`Cannot initiate handover for booking in status ${this.props.status}`)
    }
    const now = new Date()
    this.props.status = BookingStatus.AWAITING_HANDOVER
    this.props.handoverInitiatedAt = now
    this.props.updatedAt = now
  }

  // Post-inspection completes both inspection verification and customer handover in a single action
  completePostInspection(inspection: InspectionRecord): void {
    const now = new Date()
    this.props.status = BookingStatus.COMPLETED
    this.props.serviceCompletedAt = this.props.serviceCompletedAt ?? now
    this.props.handoverInitiatedAt = this.props.handoverInitiatedAt ?? now
    this.props.completedAt = now
    this.props.paymentStatus = PaymentStatus.PAID
    this.props.postServiceInspection = inspection
    this.props.updatedAt = now
  }

  complete(): void {
    if (!this.canTransitionTo(BookingStatus.COMPLETED)) {
      throw new Error(`Cannot complete booking in status ${this.props.status}`)
    }
    const now = new Date()
    this.props.status = BookingStatus.COMPLETED
    this.props.handoverInitiatedAt = this.props.handoverInitiatedAt ?? now
    this.props.completedAt = now
    this.props.paymentStatus = PaymentStatus.PAID
    this.props.updatedAt = now
  }

  cancel(reason: string, cancelledBy: string, refundAmount: number = 0): void {
    if (!this.canTransitionTo(BookingStatus.CANCELLED)) {
      throw new Error(`Cannot cancel booking in status ${this.props.status}`)
    }
    const now = new Date()
    this.props.status = BookingStatus.CANCELLED
    this.props.cancellation = {
      cancellationReason: reason,
      cancelledBy,
      cancelledAt: now,
    }
    if (refundAmount > 0) {
      this.props.refundAmount = refundAmount
      this.props.paymentStatus = PaymentStatus.REFUNDED
    }
    this.props.updatedAt = now
  }

  markNoShow(): void {
    if (!this.canTransitionTo(BookingStatus.NO_SHOW)) {
      throw new Error(`Cannot mark booking as NO_SHOW in status ${this.props.status}`)
    }
    const now = new Date()
    this.props.status = BookingStatus.NO_SHOW
    this.props.noShowAt = now
    this.props.updatedAt = now
  }

  // STALLED is an exceptional side-channel (equipment failure, payment dispute, etc.), not
  // part of the linear happy-path state machine — deliberately bypasses canTransitionTo.
  stall(reason: string, byUserId: string): void {
    const allowedEntryStatuses = [BookingStatus.CHECKED_IN, BookingStatus.IN_SERVICE]
    if (!allowedEntryStatuses.includes(this.props.status)) {
      throw new Error(
        `Only CHECKED_IN or IN_SERVICE bookings can enter STALLED state. Current status is ${this.props.status}`
      )
    }
    const now = new Date()
    this.props.stalledInfo = {
      stalledReason: reason,
      stalledBy: byUserId,
      stalledAt: now,
      previousStatus: this.props.status as "CHECKED_IN" | "IN_SERVICE",
    }
    this.props.status = BookingStatus.STALLED
    this.props.updatedAt = now
  }

  resolveStall(resolution: string, resolvedBy: string, targetStatus: BookingStatus): void {
    if (this.props.status !== BookingStatus.STALLED) {
      throw new Error(`Only STALLED bookings can be resolved. Current status is ${this.props.status}`)
    }
    const allowedTargets = [BookingStatus.CHECKED_IN, BookingStatus.IN_SERVICE, BookingStatus.CANCELLED]
    if (!allowedTargets.includes(targetStatus)) {
      throw new Error(
        "Invalid recovery target status. Allowed target recovery statuses are CHECKED_IN, IN_SERVICE, or CANCELLED"
      )
    }
    const now = new Date()
    this.props.stalledInfo = {
      ...(this.props.stalledInfo as StalledDetails),
      resolution,
      resolvedBy,
      resolvedAt: now,
    }
    this.props.status = targetStatus
    this.props.updatedAt = now
  }
}
