export type ManagerPermission =
  | "BOOKING_MANAGEMENT"
  | "QUEUE_MANAGEMENT"
  | "CUSTOMER_MANAGEMENT"
  | "PRICING_MANAGEMENT"
  | "REPORTS_VIEW"
  | "STATION_SETTINGS"

export interface ManagerListItem {
  managerId: string
  assignmentId: string
  managerUserId: string
  managerName?: string
  managerEmail: string
  managerPhone?: string
  stationId: string
  stationName: string
  permissions: ManagerPermission[]
  status: "ACTIVE" | "SUSPENDED"
  assignedAt: string
}

export interface ManagerInvitationItem {
  id: string
  email: string
  name?: string
  stationId: string
  stationName?: string
  ownerId: string
  permissions: ManagerPermission[]
  token: string
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED"
  expiresAt: string
  createdAt: string
}

export interface InviteManagerPayload {
  email: string
  name?: string
  ownerId?: string
  stationId: string
  permissions: ManagerPermission[]
}

export interface InviteManagerResult {
  type: "ASSIGNED" | "INVITED"
  assignment?: ManagerListItem
  invitation?: ManagerInvitationItem
  message: string
}
