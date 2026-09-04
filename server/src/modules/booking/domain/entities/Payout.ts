export enum PayoutStatus {
  PENDING = "PENDING",
  QUEUED = "QUEUED",
  PROCESSING = "PROCESSING",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
  REVERSED = "REVERSED",
}

export const PAYOUT_PROVIDER_RAZORPAY_X = "RAZORPAY_X" as const

export interface PayoutProps {
  id?: string

  settlementId: string
  ownerId: string

  provider: typeof PAYOUT_PROVIDER_RAZORPAY_X

  razorpayPayoutId?: string

  amount: number
  currency?: string

  status: PayoutStatus
  idempotencyKey: string

  failureReason?: string

  processedAt?: Date
  failedAt?: Date
  reversedAt?: Date

  createdAt: Date
  updatedAt?: Date
}

export class Payout {
  private readonly props: PayoutProps

  constructor(props: PayoutProps) {
    this.validate(props)
    this.props = { ...props, currency: props.currency || "INR" }
  }

  private validate(props: PayoutProps): void {
    if (!props.settlementId) {
      throw new Error("Settlement id is required")
    }
    if (!props.ownerId) {
      throw new Error("Owner id is required")
    }
    if (!props.idempotencyKey) {
      throw new Error("Idempotency key is required")
    }
    if (props.amount <= 0) {
      throw new Error("Payout amount must be greater than zero")
    }
  }

  get id(): string | undefined {
    return this.props.id
  }

  get settlementId(): string {
    return this.props.settlementId
  }

  get ownerId(): string {
    return this.props.ownerId
  }

  get provider(): typeof PAYOUT_PROVIDER_RAZORPAY_X {
    return this.props.provider
  }

  get razorpayPayoutId(): string | undefined {
    return this.props.razorpayPayoutId
  }

  get amount(): number {
    return this.props.amount
  }

  get currency(): string {
    return this.props.currency || "INR"
  }

  get status(): PayoutStatus {
    return this.props.status
  }

  get idempotencyKey(): string {
    return this.props.idempotencyKey
  }

  get failureReason(): string | undefined {
    return this.props.failureReason
  }

  get processedAt(): Date | undefined {
    return this.props.processedAt
  }

  get failedAt(): Date | undefined {
    return this.props.failedAt
  }

  get reversedAt(): Date | undefined {
    return this.props.reversedAt
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt
  }

  getProps(): PayoutProps {
    return { ...this.props }
  }

  attachProviderReference(razorpayPayoutId: string): void {
    this.props.razorpayPayoutId = razorpayPayoutId
    this.props.updatedAt = new Date()
  }

  markQueued(): void {
    const allowed = [PayoutStatus.PENDING]
    if (!allowed.includes(this.props.status)) {
      throw new Error(`Payout cannot enter QUEUED from ${this.props.status} status`)
    }
    this.props.status = PayoutStatus.QUEUED
    this.props.updatedAt = new Date()
  }

  markProcessing(): void {
    const allowed = [PayoutStatus.PENDING, PayoutStatus.QUEUED]
    if (!allowed.includes(this.props.status)) {
      throw new Error(`Payout cannot enter PROCESSING from ${this.props.status} status`)
    }
    this.props.status = PayoutStatus.PROCESSING
    this.props.updatedAt = new Date()
  }

  markProcessed(processedAt: Date = new Date()): void {
    const allowed = [PayoutStatus.PENDING, PayoutStatus.QUEUED, PayoutStatus.PROCESSING]
    if (!allowed.includes(this.props.status)) {
      throw new Error(`Payout cannot be marked PROCESSED from ${this.props.status} status`)
    }
    this.props.status = PayoutStatus.PROCESSED
    this.props.processedAt = processedAt
    this.props.updatedAt = new Date()
  }

  markFailed(reason?: string, failedAt: Date = new Date()): void {
    const allowed = [PayoutStatus.PENDING, PayoutStatus.QUEUED, PayoutStatus.PROCESSING]
    if (!allowed.includes(this.props.status)) {
      throw new Error(`Payout cannot be marked FAILED from ${this.props.status} status`)
    }
    this.props.status = PayoutStatus.FAILED
    this.props.failureReason = reason
    this.props.failedAt = failedAt
    this.props.updatedAt = new Date()
  }

  markReversed(reason?: string, reversedAt: Date = new Date()): void {
    if (this.props.status !== PayoutStatus.PROCESSED) {
      throw new Error(`Payout cannot be reversed from ${this.props.status} status`)
    }
    this.props.status = PayoutStatus.REVERSED
    this.props.failureReason = reason
    this.props.reversedAt = reversedAt
    this.props.updatedAt = new Date()
  }
}
