import { PaymentMethod, PricingSnapshot, SettlementSnapshot } from "../entities/Booking"

import { calculatePlatformCommission } from "@/configs/commission.config"

export interface CalculatePricingInput {
  basePrice: number
  extraServices: Array<{ serviceId: string; name: string; price: number }>
  paymentMethod: PaymentMethod
  isWalkIn?: boolean
  currency?: string
  platformCommissionRate?: number
  depositPercentage?: number
}

export interface CalculatedPricingResult {
  pricingSnapshot: PricingSnapshot
  depositAmount: number
  cashAmount: number
  settlement: SettlementSnapshot
}

export class BookingPricingService {
  static calculate(input: CalculatePricingInput): CalculatedPricingResult {
    const currency = input.currency || "INR"
    const extraPrice = input.extraServices.reduce((sum, item) => sum + item.price, 0)
    const totalPrice = Number((input.basePrice + extraPrice).toFixed(2))

    let depositAmount: number
    let cashAmount: number

    if (input.isWalkIn) {
      depositAmount = 0
      cashAmount = totalPrice
    } else if (input.paymentMethod === PaymentMethod.NO_PAYMENT) {
      depositAmount = 0
      cashAmount = 0
    } else if (input.paymentMethod === PaymentMethod.PAY_AT_STATION) {
      const rate = input.depositPercentage ?? 0.2
      depositAmount = Number((totalPrice * rate).toFixed(2))
      cashAmount = Number((totalPrice - depositAmount).toFixed(2))
    } else {
      depositAmount = totalPrice
      cashAmount = 0
    }

    // no platform commission for walkin booking
    const { platformCommission, stationSettlement } = input.isWalkIn
      ? { platformCommission: 0, stationSettlement: totalPrice }
      : calculatePlatformCommission(totalPrice, input.platformCommissionRate)

    return {
      pricingSnapshot: {
        basePrice: input.basePrice,
        extraPrice,
        totalPrice,
        currency,
      },
      depositAmount,
      cashAmount,
      settlement: {
        platformCommission,
        stationSettlement,
      },
    }
  }
}
