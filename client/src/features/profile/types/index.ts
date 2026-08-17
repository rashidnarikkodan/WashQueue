export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  avatar?: string
  isVerified: boolean
  createdAt: string
  updatedAt?: string
  authProvider?: string
  businessName?: string
  businessEmail?: string
  whatsapp?: string
  headquarters?: string
}

export interface UpdateProfileInput {
  name?: string
  phone?: string
  businessName?: string
  businessEmail?: string
  whatsapp?: string
  headquarters?: string
}

export interface ProfileStats {
  totalBookings: number
  favoriteStations: number
  vehiclesAdded: number
}

export interface ChangePasswordInput {
  currentPassword?: string
  newPassword: string
  confirmPassword: string
}
