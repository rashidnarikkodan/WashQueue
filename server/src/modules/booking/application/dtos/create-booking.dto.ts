import { PaymentMethod, ServiceType } from "../../domain/entities/Booking"

export interface CreateBookingInput {
  stationId: string
  vehicleId: string
  timeWindowId: string
  serviceType: ServiceType
  extraServiceIds?: string[]
  paymentMethod: PaymentMethod
}
