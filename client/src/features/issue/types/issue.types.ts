export const IssueStatus = {
  OPEN: "OPEN",
  UNDER_REVIEW: "UNDER_REVIEW",
  ESCALATED: "ESCALATED",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const
export type IssueStatus = (typeof IssueStatus)[keyof typeof IssueStatus]

export const ResolutionType = {
  REFUND: "REFUND",
  PARTIAL_REFUND: "PARTIAL_REFUND",
  SERVICE_REDO: "SERVICE_REDO",
  DISCOUNT_COUPON: "DISCOUNT_COUPON",
  APOLOGY: "APOLOGY",
  DISMISSED: "DISMISSED",
  OTHER: "OTHER",
} as const
export type ResolutionType = (typeof ResolutionType)[keyof typeof ResolutionType]

export const IssuePriority = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
} as const
export type IssuePriority = (typeof IssuePriority)[keyof typeof IssuePriority]

export const IssueCategory = {
  VEHICLE_DAMAGE: "Vehicle Damage",
  WASH_QUALITY: "Wash Quality",
  HARDWARE_FAILURE: "Hardware Failure",
  BILLING: "Billing",
  WAIT_TIME: "Wait Time / Delay",
  STAFF_BEHAVIOR: "Staff Behavior",
  OTHER: "Other",
} as const
export type IssueCategory = (typeof IssueCategory)[keyof typeof IssueCategory]

export interface Evidence {
  public_id: string
  url: string
  description?: string
}

export interface IssueHistoryEntry {
  fromStatus: string
  toStatus: string
  actionBy: string
  reason?: string
  timestamp: string | Date
}

export interface CustomerDetailsSnapshot {
  name?: string
  email?: string
  phone?: string
  avatar?: string
  membershipTier?: string
  totalWashes?: number
  priorIssuesCount?: number
}

export interface StationDetailsSnapshot {
  name?: string
  city?: string
  address?: string
  phone?: string
}

export interface BookingDetailsSnapshot {
  bookingNumber?: string
  serviceType?: string
  totalPrice?: number
  completedAt?: string | Date
  vehiclePlate?: string
  vehicleModel?: string
}

export interface IssueDto {
  id: string
  bookingId: string
  customerId: string
  stationId: string
  assignedManagerId?: string | null
  status: IssueStatus
  priority?: IssuePriority
  category?: string
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

export interface CreateIssuePayload {
  bookingId: string
  customerDescription: string
  customerEvidence?: Evidence[]
  category?: string
  priority?: IssuePriority
}

export interface UpdateIssueStatusPayload {
  status?: IssueStatus
  managerNotes?: string
  managerEvidence?: Evidence[]
}

export interface AssignIssuePayload {
  managerId: string
}

export interface EscalateIssuePayload {
  reason: string
}

export interface ResolveIssuePayload {
  resolutionType: ResolutionType
  resolutionNotes: string
  compensationAmount?: number
}

export interface CloseIssuePayload {
  notes?: string
}

export interface IssueQueryParams {
  page?: number
  limit?: number
  status?: IssueStatus | string
  priority?: IssuePriority | string
  category?: string
  search?: string
  startDate?: string
  endDate?: string
  stationId?: string
  customerId?: string
}

export interface IssueListResponse {
  issues: IssueDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface IssueMetrics {
  totalIssues: number
  openIssues: number
  underReviewIssues: number
  escalatedIssues: number
  resolvedTodayIssues: number
  criticalIssues: number
  totalTrend?: string
  openTrend?: string
  underReviewTrend?: string
  escalatedTrend?: string
  resolvedTodayTrend?: string
  criticalTrend?: string
}
