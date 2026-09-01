import { IBaseRepository } from "@/core/domain/repository.interface"
import { Settlement, SettlementProps, SettlementStatus } from "../entities/Settlement"
import {
  AdminSettlementMetricsDTO,
  OwnerEarningsSummaryDTO,
  SettlementFilterOptions,
} from "../../application/dtos/settlement.dto"

export interface ISettlementRepository extends IBaseRepository<Settlement> {
  findByBookingId(bookingId: string): Promise<Settlement | null>
  findMany(
    filters: SettlementFilterOptions
  ): Promise<{ settlements: Settlement[]; total: number }>
  getOwnerAggregatedEarnings(
    ownerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Omit<OwnerEarningsSummaryDTO, "payoutAccountStatus">>
  getAdminAggregatedMetrics(
    startDate?: Date,
    endDate?: Date
  ): Promise<AdminSettlementMetricsDTO>
  updateStatusWithGuard(
    id: string,
    newStatus: SettlementStatus,
    allowedCurrentStatuses: SettlementStatus[],
    updates?: Partial<SettlementProps>
  ): Promise<Settlement | null>
}