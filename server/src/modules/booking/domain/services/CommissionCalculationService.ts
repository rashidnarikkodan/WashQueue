import env from "@/configs/env.config"

export interface CommissionCalculationResult {
  platformCommission: number
  stationSettlement: number
  commissionRate: number
}

export class CommissionCalculationService {
  public static calculate(
    totalGrossAmount: number,
    customRate?: number,
    customCap?: number
  ): CommissionCalculationResult {
    const rate =
      customRate !== undefined && customRate >= 0 ? customRate : env.PLATFORM_COMMISSION_RATE

    const cap = customCap !== undefined && customCap >= 0 ? customCap : env.PLATFORM_COMMISSION_CAP

    const uncappedCommission = Number((totalGrossAmount * rate).toFixed(2))
    const platformCommission = Math.max(0, Math.min(uncappedCommission, cap))

    const stationSettlement = Number((totalGrossAmount - platformCommission).toFixed(2))

    return {
      platformCommission,
      stationSettlement,
      commissionRate: rate,
    }
  }
}

export function calculatePlatformCommission(
  totalGrossAmount: number,
  customRate?: number,
  customCap?: number
): CommissionCalculationResult {
  return CommissionCalculationService.calculate(totalGrossAmount, customRate, customCap)
}
