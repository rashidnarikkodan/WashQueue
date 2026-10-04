export interface IssueCreatedEvent {
  issueId: string
  bookingId: string
  customerId: string
  stationId: string
  customerDescription: string
  createdAt: Date
}

export interface IssueStatusChangedEvent {
  issueId: string
  previousStatus: string
  newStatus: string
  actionBy: string
  reason?: string
}

export interface IssueResolvedEvent {
  issueId: string
  bookingId: string
  customerId: string
  stationId: string
  resolutionType: string
  compensationAmount: number
  resolvedBy: string
  resolvedAt: Date
}
