import { IssueStatus } from "../../domain/value-objects/issue-status.vo"
import { ResolutionType } from "../../domain/value-objects/resolution-type.vo"
import { Evidence, IssueHistoryEntry } from "../../domain/value-objects/evidence.vo"
import {
  CustomerDetailsSnapshot,
  StationDetailsSnapshot,
  BookingDetailsSnapshot,
} from "../../domain/entities/Issue"

export interface CreateIssueDTO {
  bookingId: string
  customerId: string
  customerDescription: string
  customerEvidence?: Evidence[]
}

export interface UpdateIssueStatusDTO {
  issueId: string
  status?: IssueStatus
  managerNotes?: string
  managerEvidence?: Evidence[]
  actionBy: string
}

export interface AssignIssueDTO {
  issueId: string
  managerId: string
  assignedBy: string
}

export interface EscalateIssueDTO {
  issueId: string
  reason: string
  escalatedBy: string
}

export interface ResolveIssueDTO {
  issueId: string
  resolutionType: ResolutionType
  resolutionNotes: string
  compensationAmount?: number
  resolvedBy: string
}

export interface CloseIssueDTO {
  issueId: string
  closedBy: string
  notes?: string
}

export interface IssueResponseDTO {
  id: string
  bookingId: string
  customerId: string
  stationId: string
  assignedManagerId?: string | null
  status: IssueStatus
  customerDescription: string
  customerEvidence: Evidence[]
  managerNotes?: string | null
  managerEvidence: Evidence[]
  resolutionType?: ResolutionType | null
  compensationAmount: number
  resolutionNotes?: string | null
  resolvedAt?: string | null
  resolvedBy?: string | null
  history: IssueHistoryEntry[]
  customerDetails?: CustomerDetailsSnapshot
  stationDetails?: StationDetailsSnapshot
  bookingDetails?: BookingDetailsSnapshot
  createdAt: string
  updatedAt: string
}
