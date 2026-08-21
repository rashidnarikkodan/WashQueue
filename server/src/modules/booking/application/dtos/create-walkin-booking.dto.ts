import { PaymentMethod, ServiceType } from "../../domain/entities/Booking"

export interface CreateWalkInBookingInput {
  stationId: string
  timeWindowId: string
  serviceType: ServiceType
  paymentMethod?: PaymentMethod // Defaults to PAY_AT_STATION
  extraServiceIds?: string[]

  // Registered or Guest Customer
  customer?: {
    userId?: string
    name: string
    phone: string
  }

  // Vehicle information
  vehicle: {
    vehicleId?: string
    registrationNumber: string
    categoryId: string
    classId: string
  }
}
