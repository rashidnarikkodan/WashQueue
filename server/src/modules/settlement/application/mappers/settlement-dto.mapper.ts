import { Settlement } from "../../domain/entities/Settlement"
import { SettlementResponseDTO } from "../dtos/settlement.dto"

export class SettlementDTOMapper {
  static toDTO(settlement: Settlement): SettlementResponseDTO {
    const props = settlement.getProps()
    const extra = props as unknown as Record<string, unknown>
    return {
      id: props.id || "",
      bookingId: props.bookingId,
      ownerId: props.ownerId,
      stationId: props.stationId,
      totalAmount: props.totalAmount,
      platformCommission: props.platformCommission,
      platformCommissionRate: props.platformCommissionRate,
      stationSettlementAmount: props.stationSettlementAmount,
      currency: props.currency || "INR",
      status: props.status,
      payoutId: props.payoutId,
      razorpayPayoutId: props.razorpayPayoutId,
      holdReason: props.holdReason,
      failureReason: props.failureReason,
      retryCount: props.retryCount ?? 0,
      lastRetriedAt: props.lastRetriedAt ? props.lastRetriedAt.toISOString() : undefined,
      processedAt: props.processedAt ? props.processedAt.toISOString() : undefined,
      createdAt: props.createdAt ? props.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: props.updatedAt ? props.updatedAt.toISOString() : undefined,
      bookingNumber: typeof extra.bookingNumber === "string" ? extra.bookingNumber : undefined,
      stationName: typeof extra.stationName === "string" ? extra.stationName : undefined,
      customerName: typeof extra.customerName === "string" ? extra.customerName : undefined,
      vehicleRegNumber: typeof extra.vehicleRegNumber === "string" ? extra.vehicleRegNumber : undefined,
      serviceName: typeof extra.serviceName === "string" ? extra.serviceName : undefined,
      paymentMethod: typeof extra.paymentMethod === "string" ? extra.paymentMethod : undefined,
    }
  }

  static toListDTO(settlements: Settlement[]): SettlementResponseDTO[] {
    return settlements.map((s) => SettlementDTOMapper.toDTO(s))
  }
}
