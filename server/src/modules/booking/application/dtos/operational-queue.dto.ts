export interface OperationalQueueItemDTO {
  bookingId: string
  bookingNumber: string
  stationId: string
  status: string
  serviceType: string
  isWalkIn: boolean
  customerName: string
  customerPhone: string
  registrationNumber: string
  vehicleModel?: string
  windowStart?: string
  windowEnd?: string
  checkedInAt?: string
  serviceStartedAt?: string
  completedAt?: string

  // Server-Authoritative Computed Fields
  queuePosition: number // 1-indexed for waiting (CHECKED_IN), 0 for active in bay
  isBayActive: boolean // true if IN_SERVICE
  assignedBayNumber?: number // Bay # (1..totalBays)
  estimatedWaitMinutes: number
  estimatedServiceStart?: string
  stalledReason?: string
}

export interface OperationalStationQueueDTO {
  stationId: string
  stationName: string
  totalBays: number
  activeServicesCount: number
  availableBays: number
  queueDepth: number // Count of waiting vehicles (CHECKED_IN)
  totalActiveAndWaiting: number
  averageWashDurationMinutes: number
  waitingQueue: OperationalQueueItemDTO[]
  activeServices: OperationalQueueItemDTO[]
  reconciledWithMongo: boolean
}
