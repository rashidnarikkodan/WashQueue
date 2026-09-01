import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { AdminSettlementMetricsDTO } from "../dtos/settlement.dto"
import { IGetAdminSettlementMetricsUseCase } from "../interfaces/settlement.usecases"

export class GetAdminSettlementMetricsUseCase implements IGetAdminSettlementMetricsUseCase {
  constructor(private readonly settlementRepository: ISettlementRepository) {}

  async execute(startDate?: Date, endDate?: Date): Promise<AdminSettlementMetricsDTO> {
    return await this.settlementRepository.getAdminAggregatedMetrics(startDate, endDate)
  }
}
