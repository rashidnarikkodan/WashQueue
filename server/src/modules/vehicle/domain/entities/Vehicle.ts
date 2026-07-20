export interface VehicleProps {
  id: string
  userId: string
  nickname: string
  brand: string
  model: string
  year: number
  registrationNumber: string | null
  categoryId: string
  classId: string
  isPrimary: boolean
  isActive: boolean
  createdAt: Date
}

export class Vehicle {
  constructor(private readonly props: VehicleProps) {}

  get id() {
    return this.props.id
  }

  get userId() {
    return this.props.userId
  }

  get nickname() {
    return this.props.nickname
  }

  rename(nickname: string) {
    this.props.nickname = nickname.trim()
  }

  setPrimary() {
    this.props.isPrimary = true
  }

  deactivate() {
    this.props.isActive = false
  }

  activate() {
    this.props.isActive = true
  }

  get data() {
    return this.props
  }
}