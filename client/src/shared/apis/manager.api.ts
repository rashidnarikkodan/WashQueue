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

  getOwnerInvitations: async (): Promise<ManagerInvitationItem[]> => {
    const response = await api.get("/managers/invitations")
    return response.data.data
  },

  inviteManager: async (payload: InviteManagerPayload): Promise<InviteManagerResult> => {
    const response = await api.post("/managers/invite", payload)
    return response.data.data
  },

  updatePermissions: async (
    assignmentId: string,
    permissions: ManagerPermission[]
  ): Promise<ManagerListItem> => {
    const response = await api.patch(`/managers/${assignmentId}/permissions`, {
      permissions,
    })
    return response.data.data
  },

  suspendManager: async (assignmentId: string): Promise<ManagerListItem> => {
    const response = await api.patch(`/managers/${assignmentId}/suspend`)
    return response.data.data
  },

  reactivateManager: async (assignmentId: string): Promise<ManagerListItem> => {
    const response = await api.patch(`/managers/${assignmentId}/reactivate`)
    return response.data.data
  },

  removeManager: async (assignmentId: string): Promise<void> => {
    await api.delete(`/managers/${assignmentId}`)
  },

  resendInvitation: async (invitationId: string): Promise<ManagerInvitationItem> => {
    const response = await api.post(`/managers/invitations/${invitationId}/resend`)
    return response.data.data
  },

  cancelInvitation: async (invitationId: string): Promise<void> => {
    await api.delete(`/managers/invitations/${invitationId}`)
  },

  verifyInvitationToken: async (token: string): Promise<ManagerInvitationItem> => {
    const response = await api.get(`/managers/invitations/verify`, { params: { token } })
    return response.data.data
  },

  acceptInvitation: async (data: {
    token: string
    password?: string
    name?: string
    phone?: string
  }): Promise<{ message: string; user: unknown }> => {
    const response = await api.post(`/managers/invitations/accept`, data)
    return response.data.data
  },

  rejectInvitation: async (token: string): Promise<void> => {
    await api.post(`/managers/invitations/reject`, { token })
  },

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
