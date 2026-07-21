export interface CreateVehicleDto {
  nickname: string
  brand: string
  model: string
  year: number
  registrationNumber?: string | null
  categoryId: string
  classId: string
  isPrimary?: boolean
  image?: { url: string; publicId: string }
}
