import { ManagerAssignment } from "../../domain/entities/ManagerAssignment"
import { ManagerInvitation } from "../../domain/entities/ManagerInvitation"
import { ManagerListItemResponse } from "../interfaces/manager-usecases.interface"

export interface ManagerInvitationResponseDTO {
  id: string
  email: string
  name?: string
  stationId: string
  stationName?: string
  ownerId: string
  permissions: string[]
  token: string
  status: string
  expiresAt: string
  createdAt?: string
}

export class ManagerDTOMapper {
  static toAssignmentDTO(
    assignment: ManagerAssignment,
    extra?: {
      user?: { name?: string; email?: string; phone?: string }
      stationName?: string
    }
  ): ManagerListItemResponse {
    return {
      managerId: assignment.id || "",
      assignmentId: assignment.id || "",
      managerUserId: assignment.managerUserId,
      managerName: extra?.user?.name,
      managerEmail: extra?.user?.email || "Unknown",
      managerPhone: extra?.user?.phone,
      stationId: assignment.stationId,
      stationName: extra?.stationName || "Unknown Station",
      permissions: assignment.permissions,
      status: assignment.status,
      assignedAt: assignment.assignedAt,
    }
  }

  static toInvitationDTO(
    invitation: ManagerInvitation,
    extra?: { stationName?: string }
  ): ManagerInvitationResponseDTO {
    return {
      id: invitation.id || "",
      email: invitation.email,
      name: invitation.name,
      stationId: invitation.stationId,
      stationName: extra?.stationName,
      ownerId: invitation.ownerId,
      permissions: [...invitation.permissions],
      token: invitation.token,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      createdAt: invitation.createdAt ? invitation.createdAt.toISOString() : undefined,
    }
  }

  static toInvitationListDTO(invitations: ManagerInvitation[]): ManagerInvitationResponseDTO[] {
    return invitations.map((inv) => ManagerDTOMapper.toInvitationDTO(inv))
  }
}
