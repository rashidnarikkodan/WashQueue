import { IBaseRepository } from "@/core/domain/repository.interface"
import { Issue } from "../entities/Issue"
import { IssueStatus } from "../value-objects/issue-status.vo"

export interface FindIssuesFilterOptions {
  customerId?: string
  stationId?: string
  bookingId?: string
  assignedManagerId?: string
  status?: IssueStatus | IssueStatus[]
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
  sortBy?: "createdAt" | "updatedAt"
  sortOrder?: 1 | -1
}

export interface IssuesPaginatedResult {
  issues: Issue[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface IIssueRepository extends IBaseRepository<Issue> {
  create(issue: Issue): Promise<Issue>
  findByBookingId(bookingId: string): Promise<Issue | null>
  findByCustomerId(
    customerId: string,
    options?: FindIssuesFilterOptions
  ): Promise<IssuesPaginatedResult>
  findByStationId(
    stationId: string,
    options?: FindIssuesFilterOptions
  ): Promise<IssuesPaginatedResult>
  findAll(options?: FindIssuesFilterOptions): Promise<IssuesPaginatedResult>
  countByStation(stationId: string, status?: IssueStatus): Promise<number>
}
