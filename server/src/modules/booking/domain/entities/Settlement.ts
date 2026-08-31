export enum SettlementStatus {
  PENDING = "PENDING",
  SETTLED = "SETTLED",
  FAILED = "FAILED",
}

export interface SettlementProps {
  id?: string

  bookingId: string
  ownerId: string

  totalAmount: number
  platformCommission: number
  stationSettlementAmount: number

  status: SettlementStatus
  transferId?: string

  createdAt: Date
  settledAt?: Date
}

export class Settlement {
  private readonly props: SettlementProps

  constructor(props: SettlementProps) {
    this.validate(props)

    this.props = props
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

    const calculatedSettlement = Number(
      (props.totalAmount - props.platformCommission).toFixed(2)
    )

    if (Math.abs(props.stationSettlementAmount - calculatedSettlement) > 0.01) {
      throw new Error(
        "Station settlement amount must equal total amount minus platform commission"
      )
    }
  }

  get id(): string | undefined {
    return this.props?.id
  }

  get bookingId(): string {
    return this.props.bookingId
  }

  get ownerId(): string {
    return this.props.ownerId
  }

  get totalAmount(): number {
    return this.props.totalAmount
  }

  get platformCommission(): number {
    return this.props.platformCommission
  }

  get stationSettlementAmount(): number {
    return this.props.stationSettlementAmount
  }

  get status(): SettlementStatus {
    return this.props.status
  }

  get transferId(): string | undefined {
    return this.props.transferId
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get settledAt(): Date | undefined {
    return this.props.settledAt
  }

  getProps(): SettlementProps {
    return this.props
  }

  setTransferId(transferId: string): void {
    this.props.transferId = transferId
  }

  markSettled(settledAt: Date = new Date()): void {
    if (this.props.status !== SettlementStatus.PENDING) {
      throw new Error(
        `Settlement cannot be settled from ${this.props.status} status`
      )
    }

    this.props.status = SettlementStatus.SETTLED
    this.props.settledAt = settledAt
  }

  markFailed(): void {
    if (this.props.status !== SettlementStatus.PENDING) {
      throw new Error(
        `Settlement cannot fail from ${this.props.status} status`
      )
    }

    this.props.status = SettlementStatus.FAILED
  }
}