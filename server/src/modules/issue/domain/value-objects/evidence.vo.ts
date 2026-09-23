export interface Evidence {
  public_id: string
  url: string
  description?: string
}

export interface IssueHistoryEntry {
  fromStatus: string
  toStatus: string
  actionBy: string
  actionByName?: string
  reason?: string
  timestamp: Date
}
