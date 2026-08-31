import { Settlement, SettlementStatus } from "../../domain/entities/Settlement"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { ICreateSettlementUseCase } from "../interfaces/settlement.usecases"

export class CreateSettlementUseCase implements ICreateSettlementUseCase {
  constructor(private readonly settlementRepository: ISettlementRepository) {}
  async execute(data: CreateSettlementDTO): Promise<Settlement> {
    const settlement = new Settlement({
      bookingId: data.bookingId,
      ownerId: data.ownerId,
      totalAmount: data.totalAmount,
      platformCommission: data.platformCommission,
      stationSettlementAmount: data.stationSettlementAmount,
      status: SettlementStatus.PENDING,
      createdAt: new Date(),
    })
    const newSettlement = await this.settlementRepository.save(settlement)
    return newSettlement
  }
}
