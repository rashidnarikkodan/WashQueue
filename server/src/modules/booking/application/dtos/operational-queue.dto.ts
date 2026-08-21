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

  queuePosition: number
  isBayActive: boolean
  assignedBayNumber?: number
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
  queueDepth: number
  totalActiveAndWaiting: number
  averageWashDurationMinutes: number
  waitingQueue: OperationalQueueItemDTO[]
  activeServices: OperationalQueueItemDTO[]
  reconciledWithMongo: boolean
}
