import { PaymentMethod, ServiceType } from "../../domain/entities/Booking"

export interface CreateWalkInBookingInput {
  stationId: string
  timeWindowId: string
  serviceType: ServiceType
  paymentMethod?: PaymentMethod
  extraServiceIds?: string[]

  customer?: {
    userId?: string
    name: string
    phone: string
  }

  vehicle: {
    vehicleId?: string
    registrationNumber: string
    categoryId: string
    classId: string
  }
}
