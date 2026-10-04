import type { BookingResponse } from "@/shared/apis/booking.api"

export function getVehicleDisplayName(booking?: BookingResponse | null): string {
  if (!booking) return "Vehicle"
  if (booking.vehicleDetails?.brand || booking.vehicleDetails?.model) {
    return `${booking.vehicleDetails.brand || ""} ${booking.vehicleDetails.model || ""}`.trim()
  }
  if (booking.vehicleDetails?.nickname) {
    return booking.vehicleDetails.nickname
  }
  if (booking.walkInVehicle?.registrationNumber) {
    return `Walk-In Vehicle (${booking.walkInVehicle.registrationNumber})`
  }
  return "Vehicle"
}

export function getVehiclePlateNumber(booking?: BookingResponse | null): string {
  if (!booking) return "N/A"
  return (
    booking.vehicleDetails?.registrationNumber || booking.walkInVehicle?.registrationNumber || "N/A"
  )
}

export function getServiceDisplayName(booking?: BookingResponse | null): string {
  if (!booking) return "Car Wash Service"
  if (booking.serviceType === "FULL") return "Full Wash Service"
  if (booking.serviceType === "HALF") return "Half Wash Service"
  return booking.serviceType || "Car Wash Service"
}

export function getStationDisplayName(booking?: BookingResponse | null): string {
  if (!booking) return "Car Wash Station"
  return booking.stationDetails?.name || "Car Wash Station"
}
