import {
  CreateIssueDTO,
  UpdateIssueStatusDTO,
  AssignIssueDTO,
  EscalateIssueDTO,
  ResolveIssueDTO,
  CloseIssueDTO,
} from "../dtos/issue.dto"
import { Issue } from "../../domain/entities/Issue"
import {
  FindIssuesFilterOptions,
  IssuesPaginatedResult,
} from "../../domain/repositories/issue.repository.interface"

export interface ICreateIssueUseCase {
  execute(dto: CreateIssueDTO): Promise<Issue>
}

export interface IGetIssueByIdUseCase {
  execute(issueId: string, requestingUserId: string, requestingUserRole: string): Promise<Issue>
}

export interface IGetCustomerIssuesUseCase {
  execute(customerId: string, options?: FindIssuesFilterOptions): Promise<IssuesPaginatedResult>
}

export interface IGetStationIssuesUseCase {
  execute(stationId: string, options?: FindIssuesFilterOptions): Promise<IssuesPaginatedResult>
}

export interface IGetAdminIssuesUseCase {
  execute(options?: FindIssuesFilterOptions): Promise<IssuesPaginatedResult>
}

export interface IUpdateIssueStatusUseCase {
  execute(dto: UpdateIssueStatusDTO): Promise<Issue>
}

export interface IAssignIssueUseCase {
  execute(dto: AssignIssueDTO): Promise<Issue>
}

export interface IResolveIssueUseCase {
  execute(dto: ResolveIssueDTO): Promise<Issue>
}

export interface IEscalateIssueUseCase {
  execute(dto: EscalateIssueDTO): Promise<Issue>
}

export interface ICloseIssueUseCase {
  execute(dto: CloseIssueDTO): Promise<Issue>
}
