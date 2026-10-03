/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  ManagerPermission,
  ManagerListItem,
  ManagerInvitationItem,
  InviteManagerPayload,
  InviteManagerResult,
} from "../types/manager.types"
export * from "../types/manager.types"
import { api } from "../config/axios"

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

  selfAssignManager: async (stationId: string) => {
    const response = await api.post("/managers/self-assign", { stationId })
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

  getManagedStation: async (): Promise<
    {
      stationId: string
      stationName: string
      stationAddress: string
      permissions: ManagerPermission[]
      status: "ACTIVE" | "SUSPENDED"
    }[]
  > => {
    const response = await api.get("/managers/station")
    return response.data.data
  },
}
