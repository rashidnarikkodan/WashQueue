import { Settlement, SettlementStatus } from "../../domain/entities/Settlement"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { ICreateSettlementUseCase } from "../interfaces/settlement.usecases"
import { CreateSettlementDTO } from "../dtos/settlement.dto"
import logger from "@/configs/logger.config"

export class CreateSettlementUseCase implements ICreateSettlementUseCase {
  constructor(private readonly settlementRepository: ISettlementRepository) {}

  async execute(data: CreateSettlementDTO): Promise<Settlement> {
    const existing = await this.settlementRepository.findByBookingId(data.bookingId)
    if (existing) {
      return existing
    }

    const settlement = new Settlement({
      bookingId: data.bookingId,
      ownerId: data.ownerId,
      stationId: data.stationId,
      totalAmount: data.totalAmount,
      platformCommission: data.platformCommission,
      platformCommissionRate: data.platformCommissionRate,
      stationSettlementAmount: data.stationSettlementAmount,
      currency: data.currency || "INR",
      status: SettlementStatus.PENDING,
      createdAt: new Date(),
    })

    try {
      const newSettlement = await this.settlementRepository.save(settlement)
      return newSettlement
    } catch (error: unknown) {
      // Handle race condition where another request created the record concurrently
      const err = error as { code?: number; message?: string }
      if (err?.code === 11000 || err?.message?.includes("E11000")) {
        logger.info(`Duplicate settlement caught for booking ${data.bookingId}, returning existing record`)
        const existingSettlement = await this.settlementRepository.findByBookingId(data.bookingId)
        if (existingSettlement) {
          return existingSettlement
        }
      }
      throw error
    }
  }
}
