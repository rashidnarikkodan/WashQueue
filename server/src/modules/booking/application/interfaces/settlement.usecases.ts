import { Settlement } from "../../domain/entities/Settlement"
import {
  AdminSettlementMetricsDTO,
  CreateSettlementDTO,
  OwnerEarningsSummaryDTO,
  SettlementFilterOptions,
  SettlementPaginationDTO,
  SettlementResponseDTO,
} from "../dtos/settlement.dto"

export interface ICreateSettlementUseCase {
  execute(data: CreateSettlementDTO): Promise<Settlement>
}

export interface IProcessSettlementUseCase {
  execute(settlementId: string): Promise<Settlement>
}

export interface IGetOwnerSettlementSummaryUseCase {
  execute(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<OwnerEarningsSummaryDTO>
}

export interface IGetOwnerSettlementsUseCase {
  execute(
    userId: string,
    filters: SettlementFilterOptions
  ): Promise<SettlementPaginationDTO<SettlementResponseDTO>>
}

export interface IGetOwnerEarningsHistoryUseCase {
  execute(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<SettlementPaginationDTO<unknown>>
}

export interface IGetAdminSettlementsUseCase {
  execute(
    filters: SettlementFilterOptions
  ): Promise<SettlementPaginationDTO<SettlementResponseDTO>>
}

export interface IGetAdminSettlementMetricsUseCase {
  execute(startDate?: Date, endDate?: Date): Promise<AdminSettlementMetricsDTO>
}

export interface IGetSettlementByIdUseCase {
  execute(
    settlementId: string,
    requestingUserId: string,
    userRole: string
  ): Promise<SettlementResponseDTO>
}

export interface IRetrySettlementUseCase {
  execute(settlementId: string): Promise<Settlement>
}

export interface IManageSettlementHoldUseCase {
  hold(settlementId: string, reason: string): Promise<Settlement>
  release(settlementId: string): Promise<Settlement>
}