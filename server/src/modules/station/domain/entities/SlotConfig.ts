export interface SlotConfigProps {
  id: string
  stationId: string
  windowDurationMins: number
  capacityPerWindow: number
  walkInReservedSlots: number
  maxAdvanceBookingDays: number
  allowWalkIns: boolean
  createdAt: Date
  updatedAt: Date
}

export class SlotConfig {
  constructor(private props: SlotConfigProps) {}

  get id() {
    return this.props.id
  }

  get stationId() {
    return this.props.stationId
  }

  get windowDurationMins() {
    return this.props.windowDurationMins
  }

  get capacityPerWindow() {
    return this.props.capacityPerWindow
  }

  get walkInReservedSlots() {
    return this.props.walkInReservedSlots
  }

  get maxAdvanceBookingDays() {
    return this.props.maxAdvanceBookingDays
  }

  get allowWalkIns() {
    return this.props.allowWalkIns
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  getProps(): SlotConfigProps {
    return { ...this.props }
  }
}
