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
  image?: { url: string; publicId: string }
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
  imageFile?: File | null
}

export interface VehicleDocument {
  id: string
  name: string
  size?: string
  fileUrl?: string
  uploadedAt: string
}

export interface VehicleWashActivity {
  id: string
  stationName: string
  serviceName: string
  date: string
  amount: number
  status: "COMPLETED" | "CANCELLED" | "IN_PROGRESS"
}

export interface VehicleMaintenanceInfo {
  usagePattern: string
  lastWashDate: string
  suggestedNextWashDate: string
  recommendationAlert?: string
}
