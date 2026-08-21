import { PaymentMethod, PricingSnapshot, SettlementSnapshot } from "../entities/Booking"

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

    let depositAmount = 0
    let cashAmount = 0

    if (input.paymentMethod === PaymentMethod.NO_PAYMENT) {
      depositAmount = 0
      cashAmount = 0
    } else if (input.paymentMethod === PaymentMethod.PAY_AT_STATION) {
      if (input.isWalkIn) {
        depositAmount = 0
        cashAmount = totalPrice
      } else {
        const rate = input.depositPercentage ?? 0.2
        depositAmount = Number((totalPrice * rate).toFixed(2))
        cashAmount = Number((totalPrice - depositAmount).toFixed(2))
      }
    } else {
      depositAmount = totalPrice
      cashAmount = 0
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
