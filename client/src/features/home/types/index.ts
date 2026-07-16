export interface ActiveBooking {
  id: string
  queuePosition: string
  status: string
  estimatedWait: string
  bayInfo: string
  vehicleName: string
  steps: {
    label: string
    status: "completed" | "current" | "upcoming"
  }[]
}

export interface QueueIntelligence {
  averageWait: string
  washSpeed: string
}

export interface WeatherInsights {
  temperature: string
  alertTitle: string
  alertDetails: string
}

export interface GarageVehicle {
  id: string
  brand: string
  model: string
  plate: string
  image: string
  status: "good" | "overdue"
  statusText: string
  isPrimary: boolean
  typeBadges: string[]
  modelYear: string
  lastWash: string
  nextWash: string
  usage: string
}

export interface WalletInfo {
  balance: string
  loyaltyPoints: string
  tierProgress: number
  pointsToNextTier: string
  rewardDetails: string
}
