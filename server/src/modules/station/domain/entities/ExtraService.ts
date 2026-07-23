export interface ExtraServicePricingEntry {
  vehicleClassId: string
  price: number
}

export interface ExtraServiceProps {
  id: string
  stationId: string
  name: string
  slug: string
  description?: string
  pricing: ExtraServicePricingEntry[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class ExtraService {
  constructor(private props: ExtraServiceProps) {}

  get id() {
    return this.props.id
  }

  get stationId() {
    return this.props.stationId
  }

  get name() {
    return this.props.name
  }

  get slug() {
    return this.props.slug
  }

  get description() {
    return this.props.description
  }

  get pricing() {
    return this.props.pricing
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

  getProps(): ExtraServiceProps {
    return { ...this.props }
  }
}
