import { slugify } from "@/common/utils/slugify";

export interface VehicleCategoryProps {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
}

export class VehicleCategory {
  constructor(private readonly props: VehicleCategoryProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  get order(): number {
    return this.props.order;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  rename(name: string): void {
    this.props.name = name;
    this.props.slug = slugify(name);
  }

  changeOrder(order: number): void {
    this.props.order = order;
  }

  changeStatus(isActive: boolean): void {
    this.props.isActive = isActive;
  }
}