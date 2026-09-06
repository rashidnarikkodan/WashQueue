import { slugify } from "@/common/utils/slugify"

export interface VehicleClassProps {
  id: string
  categoryId: string
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
}

export class VehicleClass {
  constructor(private readonly props: VehicleClassProps) {}

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

  get description(): string | undefined {
    return this.props.description
  }

  get order(): number {
    return this.props.order
  }

  get isActive(): boolean {
    return this.props.isActive
  }

  rename(name: string): void {
    this.props.name = name
    this.props.slug = slugify(name)
  }

  changeCategory(categoryId: string): void {
    this.props.categoryId = categoryId
  }

  changeDescription(description?: string): void {
    this.props.description = description
  }

  changeOrder(order: number): void {
    this.props.order = order
  }

  changeStatus(isActive: boolean): void {
    this.props.isActive = isActive
  }
}
