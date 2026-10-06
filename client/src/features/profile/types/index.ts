export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  role: "customer" | "owner" | "manager" | "admin" | string
  avatar?: string
  isVerified: boolean
  createdAt: string
  updatedAt?: string
  authProvider?: string
  bio?: string
  emergencyContact?: string

  // Owner specific
  businessName?: string
  businessEmail?: string
  taxId?: string
  whatsapp?: string
  headquarters?: string
  businessDescription?: string
  payoutAccount?: string

  // Manager specific
  assignedStationId?: string
  assignedStationName?: string
  shiftSchedule?: string
  managerBadgeId?: string

  // Admin specific
  adminTier?: string
  department?: string
  securityClearance?: string
}

export interface UpdateProfileInput {
  name?: string
  phone?: string
  bio?: string
  emergencyContact?: string
  avatar?: string

  // Owner fields
  businessName?: string
  businessEmail?: string
  taxId?: string
  whatsapp?: string
  headquarters?: string
  businessDescription?: string

  // Manager fields
  assignedStationName?: string
  shiftSchedule?: string
  managerBadgeId?: string

  // Admin fields
  adminTier?: string
  department?: string
}

export interface ProfileStats {
  // Customer stats
  totalBookings: number
  favoriteStations: number
  vehiclesAdded: number

  // Owner stats
  activeStations?: number
  totalRevenueProcessed?: string
  activeStaff?: number

  // Manager stats
  todayQueuesHandled?: number
  inspectionsCompleted?: number

  // Admin stats
  systemUsersCount?: number
  platformStationsCount?: number
  openTicketsCount?: number
}

export interface ChangePasswordInput {
  currentPassword?: string
  newPassword: string
  confirmPassword: string
}
