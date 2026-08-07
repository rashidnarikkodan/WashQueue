import { api } from "../config/axios"

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

export const managerApi = {
  /** Fetch all managers belonging to the authenticated owner */
  getOwnerManagers: async (params?: {
    stationId?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<{ managers: ManagerListItem[]; total: number }> => {
    const response = await api.get("/managers", { params })
    return response.data.data
  },

  /** Fetch all pending invitations for the owner */
  getOwnerInvitations: async (): Promise<ManagerInvitationItem[]> => {
    const response = await api.get("/managers/invitations")
    return response.data.data
  },

  /** Send an invitation or directly assign a manager */
  inviteManager: async (payload: InviteManagerPayload): Promise<InviteManagerResult> => {
    const response = await api.post("/managers/invite", payload)
    return response.data.data
  },

  /** Update manager permissions */
  updatePermissions: async (
    assignmentId: string,
    permissions: ManagerPermission[]
  ): Promise<ManagerListItem> => {
    const response = await api.patch(`/managers/${assignmentId}/permissions`, {
      permissions,
    })
    return response.data.data
  },

  /** Suspend manager */
  suspendManager: async (assignmentId: string): Promise<ManagerListItem> => {
    const response = await api.patch(`/managers/${assignmentId}/suspend`)
    return response.data.data
  },

  /** Reactivate suspended manager */
  reactivateManager: async (assignmentId: string): Promise<ManagerListItem> => {
    const response = await api.patch(`/managers/${assignmentId}/reactivate`)
    return response.data.data
  },

  /** Remove manager assignment */
  removeManager: async (assignmentId: string): Promise<void> => {
    await api.delete(`/managers/${assignmentId}`)
  },

  /** Resend invitation */
  resendInvitation: async (invitationId: string): Promise<ManagerInvitationItem> => {
    const response = await api.post(`/managers/invitations/${invitationId}/resend`)
    return response.data.data
  },

  /** Cancel invitation */
  cancelInvitation: async (invitationId: string): Promise<void> => {
    await api.delete(`/managers/invitations/${invitationId}`)
  },

  /** Public: Verify invitation token */
  verifyInvitationToken: async (token: string): Promise<ManagerInvitationItem> => {
    const response = await api.get(`/managers/invitations/verify`, { params: { token } })
    return response.data.data
  },

  /** Public: Accept invitation and complete registration */
  acceptInvitation: async (data: {
    token: string
    password?: string
    name?: string
    phone?: string
  }): Promise<{ message: string; user: unknown }> => {
    const response = await api.post(`/managers/invitations/accept`, data)
    return response.data.data
  },

  /** Public: Reject invitation */
  rejectInvitation: async (token: string): Promise<void> => {
    await api.post(`/managers/invitations/reject`, { token })
  },

  /** Authenticated Manager: Get assigned stations with permissions */
  getManagedStations: async (): Promise<
    {
      stationId: string
      stationName: string
      stationAddress: string
      permissions: ManagerPermission[]
      status: "ACTIVE" | "SUSPENDED"
    }[]
  > => {
    const response = await api.get("/managers/my-stations")
    return response.data.data
  },
}
