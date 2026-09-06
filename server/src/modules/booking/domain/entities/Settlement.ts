export enum SettlementStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PROCESSED = "PROCESSED",
  HELD = "HELD",
  FAILED = "FAILED",
  REVERSED = "REVERSED",
}

export enum SettlementHoldReason {
  MISSING_PAYOUT_ACCOUNT = "MISSING_PAYOUT_ACCOUNT",
  ACCOUNT_NOT_VERIFIED = "ACCOUNT_NOT_VERIFIED",
  MANUAL_HOLD = "MANUAL_HOLD",
  DISPUTE = "DISPUTE",
}

export interface SettlementProps {
  id?: string

  bookingId: string
  ownerId: string
  stationId?: string

  totalAmount: number
  platformCommission: number
  platformCommissionRate?: number
  stationSettlementAmount: number
  currency?: string

  status: SettlementStatus
  payoutId?: string

  holdReason?: string
  failureReason?: string
  retryCount?: number
  lastRetriedAt?: Date

  createdAt: Date
  updatedAt?: Date
  processedAt?: Date
}

export class Settlement {
  private readonly props: SettlementProps

  constructor(props: SettlementProps) {
    this.validate(props)
    this.props = {
      ...props,
      currency: props.currency || "INR",
      retryCount: props.retryCount ?? 0,
    }
  }

  private validate(props: SettlementProps): void {
    if (!props.bookingId) {
      throw new Error("Booking id is required")
    }

    if (!props.ownerId) {
      throw new Error("Owner id is required")
    }

    if (props.totalAmount < 0) {
      throw new Error("Total amount cannot be negative")
    }

    if (props.platformCommission < 0) {
      throw new Error("Platform commission cannot be negative")
    }

    if (props.stationSettlementAmount < 0) {
      throw new Error("Station settlement amount cannot be negative")
    }

    const calculatedSettlement = Number((props.totalAmount - props.platformCommission).toFixed(2))

    if (Math.abs(props.stationSettlementAmount - calculatedSettlement) > 0.01) {
      throw new Error("Station settlement amount must equal total amount minus platform commission")
    }
  }

  get id(): string | undefined {
    return this.props.id
  }

  get bookingId(): string {
    return this.props.bookingId
  }

  get ownerId(): string {
    return this.props.ownerId
  }

  get stationId(): string | undefined {
    return this.props.stationId
  }

  get totalAmount(): number {
    return this.props.totalAmount
  }

  get platformCommission(): number {
    return this.props.platformCommission
  }

  get platformCommissionRate(): number | undefined {
    return this.props.platformCommissionRate
  }

  get stationSettlementAmount(): number {
    return this.props.stationSettlementAmount
  }

  get currency(): string {
    return this.props.currency || "INR"
  }

  get status(): SettlementStatus {
    return this.props.status
  }

  get payoutId(): string | undefined {
    return this.props.payoutId
  }

  get holdReason(): string | undefined {
    return this.props.holdReason
  }

  get failureReason(): string | undefined {
    return this.props.failureReason
  }

  get retryCount(): number {
    return this.props.retryCount || 0
  }

  get lastRetriedAt(): Date | undefined {
    return this.props.lastRetriedAt
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt
  }

  get processedAt(): Date | undefined {
    return this.props.processedAt
  }

  getProps(): SettlementProps {
    return { ...this.props }
  }

  setPayoutId(payoutId: string): void {
    this.props.payoutId = payoutId
  }

  markProcessing(): void {
    const allowed = [SettlementStatus.PENDING, SettlementStatus.FAILED, SettlementStatus.HELD]
    if (!allowed.includes(this.props.status)) {
      throw new Error(`Settlement cannot enter PROCESSING from ${this.props.status} status`)
    }
    this.props.status = SettlementStatus.PROCESSING
    this.props.updatedAt = new Date()
  }

  markProcessed(payoutId?: string, processedAt: Date = new Date()): void {
    const allowed = [SettlementStatus.PENDING, SettlementStatus.PROCESSING]
    if (!allowed.includes(this.props.status)) {
      throw new Error(`Settlement cannot be marked PROCESSED from ${this.props.status} status`)
    }

    if (payoutId) {
      this.props.payoutId = payoutId
    }
    this.props.status = SettlementStatus.PROCESSED
    this.props.processedAt = processedAt
    this.props.holdReason = undefined
    this.props.failureReason = undefined
    this.props.updatedAt = new Date()
  }

  markFailed(reason?: string): void {
    const allowed = [SettlementStatus.PENDING, SettlementStatus.PROCESSING]
    if (!allowed.includes(this.props.status)) {
      throw new Error(`Settlement cannot fail from ${this.props.status} status`)
    }

    this.props.status = SettlementStatus.FAILED
    this.props.failureReason = reason
    this.props.retryCount = (this.props.retryCount || 0) + 1
    this.props.lastRetriedAt = new Date()
    this.props.updatedAt = new Date()
  }

  markHeld(reason: string): void {
    const allowed = [SettlementStatus.PENDING, SettlementStatus.PROCESSING, SettlementStatus.FAILED]
    if (!allowed.includes(this.props.status)) {
      throw new Error(`Settlement cannot be held from ${this.props.status} status`)
    }

    this.props.status = SettlementStatus.HELD
    this.props.holdReason = reason
    this.props.updatedAt = new Date()
  }

  releaseHold(): void {
    if (this.props.status !== SettlementStatus.HELD) {
      throw new Error(`Cannot release hold on settlement with status ${this.props.status}`)
    }

    this.props.status = SettlementStatus.PENDING
    this.props.holdReason = undefined
    this.props.updatedAt = new Date()
  }

  markReversed(reason?: string): void {
    if (this.props.status !== SettlementStatus.PROCESSED) {
      throw new Error(`Settlement cannot be reversed from ${this.props.status} status`)
    }

    this.props.status = SettlementStatus.REVERSED
    this.props.failureReason = reason
    this.props.updatedAt = new Date()
  }
}
