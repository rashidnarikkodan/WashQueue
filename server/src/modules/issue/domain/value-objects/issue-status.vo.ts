export enum IssueStatus {
  OPEN = "OPEN",
  UNDER_REVIEW = "UNDER_REVIEW",
  ESCALATED = "ESCALATED",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export const VALID_ISSUE_STATUSES = Object.values(IssueStatus)
