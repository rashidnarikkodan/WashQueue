export interface VehicleCategoryProps {
  id: string
  name: string
  slug: string
  order: number
}

export class VehicleCategory {
  constructor(private readonly props: VehicleCategoryProps) {}

  get id(): string {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get slug(): string {
    return this.props.slug
  }

  get order(): number {
    return this.props.order
  }
  rename(name: string, slug: string): void {
    this.props.name = name
    this.props.slug = slug
  }

  changeOrder(order: number): void {
    this.props.order = order
  }
}
