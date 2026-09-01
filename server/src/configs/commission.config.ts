export interface PlatformCommissionConfig {
  defaultRate: number // e.g. 0.10 for 10%
  maxCap: number // max commission in currency units (e.g. 150 INR)
  minCommission: number
}

export const PLATFORM_COMMISSION_CONFIG: PlatformCommissionConfig = {
  defaultRate: Number(process.env.PLATFORM_COMMISSION_RATE) || 0.10,
  maxCap: Number(process.env.PLATFORM_COMMISSION_CAP) || 150,
  minCommission: 0,
}

export interface CommissionCalculationResult {
  platformCommission: number
  stationSettlement: number
  commissionRate: number
}

/**
 * Calculates platform commission and station net settlement.
 * Uses configured platform rate (capped at maxCap) or custom station-level override if provided.
 */
export function calculatePlatformCommission(
  totalGrossAmount: number,
  customRate?: number,
  customCap?: number
): CommissionCalculationResult {
  const rate = customRate !== undefined && customRate >= 0 ? customRate : PLATFORM_COMMISSION_CONFIG.defaultRate
  const cap = customCap !== undefined && customCap >= 0 ? customCap : PLATFORM_COMMISSION_CONFIG.maxCap

  const uncappedCommission = Number((totalGrossAmount * rate).toFixed(2))
  const platformCommission = Math.max(
    PLATFORM_COMMISSION_CONFIG.minCommission,
    Math.min(uncappedCommission, cap)
  )

  const stationSettlement = Number((totalGrossAmount - platformCommission).toFixed(2))

  return {
    platformCommission,
    stationSettlement,
    commissionRate: rate,
  }
}
