import { PaymentType, PricingSnapshot, SettlementSnapshot } from "../entities/Booking"

export interface CalculatePricingInput {
  basePrice: number
  extraServices: Array<{ serviceId: string; name: string; price: number }>
  paymentType: PaymentType
  currency?: string
  platformCommissionRate?: number // Default 0.10 (10%)
  depositPercentage?: number // Default 0.20 (20%)
}

export interface CalculatedPricingResult {
  pricingSnapshot: PricingSnapshot
  depositAmount: number
  cashAmount: number
  settlement: SettlementSnapshot
}

export class BookingPricingService {
  static calculate(input: CalculatePricingInput): CalculatedPricingResult {
    const currency = input.currency || "USD"
    const extraPrice = input.extraServices.reduce((sum, item) => sum + item.price, 0)
    const totalPrice = Number((input.basePrice + extraPrice).toFixed(2))

    let depositAmount = 0
    let cashAmount = 0

    if (input.paymentType === PaymentType.ONLINE_FULL) {
      depositAmount = totalPrice
      cashAmount = 0
    } else if (input.paymentType === PaymentType.DEPOSIT_PLUS_CASH) {
      const rate = input.depositPercentage ?? 0.2
      depositAmount = Number((totalPrice * rate).toFixed(2))
      cashAmount = Number((totalPrice - depositAmount).toFixed(2))
    } else if (input.paymentType === PaymentType.CASH_WALKIN) {
      depositAmount = 0
      cashAmount = totalPrice
    }

    const commissionRate = input.platformCommissionRate ?? 0.1
    const platformCommission = Number((totalPrice * commissionRate).toFixed(2))
    const stationSettlement = Number((totalPrice - platformCommission).toFixed(2))

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
