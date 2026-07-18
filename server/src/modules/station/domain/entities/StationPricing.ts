export interface StationPricingProps {
  id: string
  stationId: string
  vehicleClassId: string
  halfWashPrice: number
  fullWashPrice: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class StationPricing {
  constructor(private props: StationPricingProps) {}

  get id() {
    return this.props.id
  }

  get stationId() {
    return this.props.stationId
  }

  get vehicleClassId() {
    return this.props.vehicleClassId
  }

  get halfWashPrice() {
    return this.props.halfWashPrice
  }

  get fullWashPrice() {
    return this.props.fullWashPrice
  }

  get isActive() {
    return this.props.isActive
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  getProps(): StationPricingProps {
    return { ...this.props }
  }
}
