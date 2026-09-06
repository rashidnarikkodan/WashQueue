export type TimeWindowStatus = "OPEN" | "FULL" | "CLOSED" | "PAST"

export interface TimeWindowInstanceProps {
  id: string
  stationId: string
  date: string
  windowStart: Date
  windowEnd: Date
  capacityTotal: number
  walkInReservedSlots: number
  advanceBookedCount: number
  walkInCount: number
  status: TimeWindowStatus
  createdAt: Date
  updatedAt: Date
}

export class TimeWindowInstance {
  constructor(private props: TimeWindowInstanceProps) {}

  get id() {
    return this.props.id
  }

  get stationId() {
    return this.props.stationId
  }

  get date() {
    return this.props.date
  }

  get windowStart() {
    return this.props.windowStart
  }

  get windowEnd() {
    return this.props.windowEnd
  }

  get capacityTotal() {
    return this.props.capacityTotal
  }

  get walkInReservedSlots() {
    return this.props.walkInReservedSlots
  }

  get advanceBookedCount() {
    return this.props.advanceBookedCount
  }

  get walkInCount() {
    return this.props.walkInCount
  }

  get status() {
    return this.props.status
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get onlineCapacity(): number {
    return Math.max(0, this.props.capacityTotal - this.props.walkInReservedSlots)
  }

  get remainingOnlineCapacity(): number {
    return Math.max(0, this.onlineCapacity - this.props.advanceBookedCount)
  }

  get isBookable(): boolean {
    return this.props.status === "OPEN" && this.remainingOnlineCapacity > 0
  }

  updateStatusBasedOnTimeAndCapacity(now: Date = new Date()): void {
    if (this.props.windowEnd <= now) {
      this.props.status = "PAST"
    } else if (this.remainingOnlineCapacity <= 0) {
      this.props.status = "FULL"
    } else if (this.props.status !== "CLOSED") {
      this.props.status = "OPEN"
    }
  }

  reserveAdvanceSlot(): void {
    if (!this.isBookable) {
      throw new Error(`Time window ${this.id} is not bookable`)
    }
    this.props.advanceBookedCount += 1
    if (this.remainingOnlineCapacity <= 0) {
      this.props.status = "FULL"
    }
    this.props.updatedAt = new Date()
  }

  reserveWalkInSlot(): void {
    this.props.walkInCount += 1
    this.props.updatedAt = new Date()
  }

  getProps(): TimeWindowInstanceProps {
    return { ...this.props }
  }
}
