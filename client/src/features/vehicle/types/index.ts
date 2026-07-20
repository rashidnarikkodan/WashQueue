export interface Vehicle {
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
  createdAt: string
}

export interface CreateVehicleInput {
  nickname: string
  brand: string
  model: string
  year: number
  registrationNumber?: string | null
  categoryId: string
  classId: string
  isPrimary?: boolean
}
