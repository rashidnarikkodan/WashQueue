import { IssueStatus } from "../value-objects/issue-status.vo"
import { ResolutionType } from "../value-objects/resolution-type.vo"
import { Evidence, IssueHistoryEntry } from "../value-objects/evidence.vo"

export interface CustomerDetailsSnapshot {
  name?: string
  email?: string
  phone?: string
  avatar?: string
}

export interface StationDetailsSnapshot {
  name?: string
  city?: string
  address?: string
}

export interface BookingDetailsSnapshot {
  bookingNumber?: string
  serviceType?: string
  totalPrice?: number
  completedAt?: Date
}

export interface IssueProps {
  id?: string
  bookingId: string
  customerId: string
  stationId: string
  assignedManagerId?: string | null
  status: IssueStatus
  customerDescription: string
  customerEvidence?: Evidence[]
  managerNotes?: string | null
  managerEvidence?: Evidence[]
  resolutionType?: ResolutionType | null
  compensationAmount?: number
  resolutionNotes?: string | null
  resolvedAt?: Date | null
  resolvedBy?: string | null
  history?: IssueHistoryEntry[]
  customerDetails?: CustomerDetailsSnapshot
  stationDetails?: StationDetailsSnapshot
  bookingDetails?: BookingDetailsSnapshot
  createdAt?: Date
  updatedAt?: Date
}

export class Issue {
  private readonly props: IssueProps

  constructor(props: IssueProps) {
    if (!props.bookingId) throw new Error("Issue must have a valid bookingId")
    if (!props.customerId) throw new Error("Issue must have a valid customerId")
    if (!props.stationId) throw new Error("Issue must have a valid stationId")
    if (!props.customerDescription || props.customerDescription.trim().length === 0) {
      throw new Error("Customer description cannot be empty")
    }

    this.props = {
      ...props,
      assignedManagerId: props.assignedManagerId ?? null,
      status: props.status ?? IssueStatus.OPEN,
      customerEvidence: props.customerEvidence ?? [],
      managerNotes: props.managerNotes ?? null,
      managerEvidence: props.managerEvidence ?? [],
      resolutionType: props.resolutionType ?? null,
      compensationAmount: props.compensationAmount ?? 0,
      resolutionNotes: props.resolutionNotes ?? null,
      resolvedAt: props.resolvedAt ?? null,
      resolvedBy: props.resolvedBy ?? null,
      history: props.history ?? [],
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }
  }

  get id(): string | undefined {
    return this.props.id
  }

  get bookingId(): string {
    return this.props.bookingId
  }

  get customerId(): string {
    return this.props.customerId
  }

  get stationId(): string {
    return this.props.stationId
  }

  get assignedManagerId(): string | null | undefined {
    return this.props.assignedManagerId
  }

  get status(): IssueStatus {
    return this.props.status
  }

  get customerDescription(): string {
    return this.props.customerDescription
  }

  get customerEvidence(): Evidence[] {
    return this.props.customerEvidence ?? []
  }

  get managerNotes(): string | null | undefined {
    return this.props.managerNotes
  }

  get managerEvidence(): Evidence[] {
    return this.props.managerEvidence ?? []
  }

  get resolutionType(): ResolutionType | null | undefined {
    return this.props.resolutionType
  }

  get compensationAmount(): number {
    return this.props.compensationAmount ?? 0
  }

  get resolutionNotes(): string | null | undefined {
    return this.props.resolutionNotes
  }

  get resolvedAt(): Date | null | undefined {
    return this.props.resolvedAt
  }

  get resolvedBy(): string | null | undefined {
    return this.props.resolvedBy
  }

  get history(): IssueHistoryEntry[] {
    return this.props.history ?? []
  }

  get customerDetails(): CustomerDetailsSnapshot | undefined {
    return this.props.customerDetails
  }

  get stationDetails(): StationDetailsSnapshot | undefined {
    return this.props.stationDetails
  }

  get bookingDetails(): BookingDetailsSnapshot | undefined {
    return this.props.bookingDetails
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt
  }

  get data(): IssueProps {
    return { ...this.props }
  }

  private recordHistory(
    fromStatus: IssueStatus,
    toStatus: IssueStatus,
    actionBy: string,
    reason?: string
  ) {
    if (!this.props.history) {
      this.props.history = []
    }
    this.props.history.push({
      fromStatus,
      toStatus,
      actionBy,
      reason,
      timestamp: new Date(),
    })
  }

  startReview(managerId: string, notes?: string): void {
    if (this.props.status === IssueStatus.CLOSED) {
      throw new Error("Cannot review a closed issue")
    }
    const previous = this.props.status
    this.props.status = IssueStatus.UNDER_REVIEW
    this.props.assignedManagerId = managerId
    if (notes) {
      this.props.managerNotes = notes
    }
    this.props.updatedAt = new Date()
    this.recordHistory(previous, IssueStatus.UNDER_REVIEW, managerId, notes)
  }

  assignManager(managerId: string, assignedBy: string): void {
    if (this.props.status === IssueStatus.CLOSED) {
      throw new Error("Cannot assign manager to a closed issue")
    }
    this.props.assignedManagerId = managerId
    if (this.props.status === IssueStatus.OPEN) {
      const previous = this.props.status
      this.props.status = IssueStatus.UNDER_REVIEW
      this.recordHistory(
        previous,
        IssueStatus.UNDER_REVIEW,
        assignedBy,
        `Assigned to manager ${managerId}`
      )
    }
    this.props.updatedAt = new Date()
  }

  updateManagerNotesAndEvidence(notes?: string, evidence?: Evidence[]): void {
    if (this.props.status === IssueStatus.CLOSED) {
      throw new Error("Cannot update evidence on a closed issue")
    }
    if (notes !== undefined) {
      this.props.managerNotes = notes
    }
    if (evidence !== undefined) {
      this.props.managerEvidence = evidence
    }
    this.props.updatedAt = new Date()
  }

  escalate(escalatedBy: string, reason: string): void {
    if (this.props.status === IssueStatus.CLOSED) {
      throw new Error("Cannot escalate a closed issue")
    }
    const previous = this.props.status
    this.props.status = IssueStatus.ESCALATED
    this.props.updatedAt = new Date()
    this.recordHistory(previous, IssueStatus.ESCALATED, escalatedBy, reason)
  }

  resolve(
    resolvedBy: string,
    resolutionType: ResolutionType,
    notes: string,
    compensationAmount: number = 0
  ): void {
    if (this.props.status === IssueStatus.CLOSED) {
      throw new Error("Cannot resolve an already closed issue")
    }
    const previous = this.props.status
    const now = new Date()
    this.props.status = IssueStatus.RESOLVED
    this.props.resolutionType = resolutionType
    this.props.resolutionNotes = notes
    this.props.compensationAmount = Math.max(0, compensationAmount)
    this.props.resolvedBy = resolvedBy
    this.props.resolvedAt = now
    this.props.updatedAt = now
    this.recordHistory(
      previous,
      IssueStatus.RESOLVED,
      resolvedBy,
      `Resolved as ${resolutionType}. Notes: ${notes}`
    )
  }

  close(closedBy: string, notes?: string): void {
    if (this.props.status === IssueStatus.CLOSED) {
      throw new Error("Issue is already closed")
    }
    const previous = this.props.status
    this.props.status = IssueStatus.CLOSED
    this.props.updatedAt = new Date()
    this.recordHistory(previous, IssueStatus.CLOSED, closedBy, notes ?? "Issue closed")
  }

  reopen(reopenedBy: string, reason: string): void {
    if (this.props.status !== IssueStatus.RESOLVED && this.props.status !== IssueStatus.CLOSED) {
      throw new Error("Only resolved or closed issues can be reopened")
    }
    const previous = this.props.status
    this.props.status = IssueStatus.OPEN
    this.props.updatedAt = new Date()
    this.recordHistory(previous, IssueStatus.OPEN, reopenedBy, `Reopened: ${reason}`)
  }
}
