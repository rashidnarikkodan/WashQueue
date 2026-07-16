export interface VehicleClassProps {
  id: string
  categoryId: string
  name: string
  slug: string
  order: number
}

export class VehicleClass {
  constructor(private props: VehicleClassProps) {}

  get id(): string {
    return this.props.id
  }

  get categoryId(): string {
    return this.props.categoryId
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

  changeCategory(categoryId: string): void {
    this.props.categoryId = categoryId
  }

  changeOrder(order: number): void {
    this.props.order = order
  }
}
