import { StationProps } from "@/modules/station/domain/entities/Station"
import { ManagerAssignment, ManagerPermission } from "../../domain/entities/ManagerAssignment"
import { ManagerInvitation } from "../../domain/entities/ManagerInvitation"

export interface InviteManagerInput {
  email: string
  name?: string
  stationId: string
  permissions: ManagerPermission[]
}

export interface InviteManagerResponse {
  type: "ASSIGNED" | "INVITED"
  assignment?: ManagerAssignment
  invitation?: ManagerInvitation
  message: string
}

export interface AcceptInvitationInput {
  token: string
  password?: string
  name?: string
  phone?: string
}

export interface ListOwnerManagersInput {
  stationId?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface ManagerListItemResponse {
  managerId: string
  assignmentId: string
  managerUserId: string
  managerName?: string
  managerEmail: string
  managerPhone?: string
  stationId: string
  stationName: string
  permissions: ManagerPermission[]
  status: string
  assignedAt: Date
}

export interface ManagedStationResponse {
  stationId: string
  stationName: string
  stationAddress?: unknown
  permissions: ManagerPermission[]
  status: string
}

export interface IInviteManagerUseCase {
  execute(ownerUserId: string, input: InviteManagerInput): Promise<InviteManagerResponse>
}

export interface IAcceptInvitationUseCase {
  execute(
    input: AcceptInvitationInput
  ): Promise<{ message: string; user: { id: string; email: string; name?: string; role: string } }>
}

export interface IRejectInvitationUseCase {
  execute(token: string): Promise<void>
}

export interface ICancelInvitationUseCase {
  execute(ownerUserId: string, invitationId: string): Promise<void>
}

export interface IResendInvitationUseCase {
  execute(ownerUserId: string, invitationId: string): Promise<ManagerInvitation>
}

export interface IGetOwnerManagersUseCase {
  execute(
    ownerUserId: string,
    filters?: ListOwnerManagersInput
  ): Promise<{ managers: ManagerListItemResponse[]; total: number }>
}

export interface IGetOwnerInvitationsUseCase {
  execute(ownerUserId: string): Promise<ManagerInvitation[]>
}

export interface IUpdateManagerPermissionsUseCase {
  execute(
    ownerUserId: string,
    assignmentId: string,
    permissions: ManagerPermission[]
  ): Promise<ManagerAssignment>
}

export interface ISuspendManagerUseCase {
  execute(ownerUserId: string, assignmentId: string): Promise<ManagerAssignment>
}

export interface IReactivateManagerUseCase {
  execute(ownerUserId: string, assignmentId: string): Promise<ManagerAssignment>
}

export interface IRemoveManagerUseCase {
  execute(ownerUserId: string, assignmentId: string): Promise<void>
}

export interface IGetManagedStationUseCase {
  execute(managerUserId: string): Promise<ManagedStationResponse[]>
}

export interface IVerifyInvitationTokenUseCase {
  execute(token: string): Promise<ManagerInvitation>
}

export interface ISelfAssignManagerUseCase {
  execute(data:{stationId:string,ownerUserId:string}): Promise<StationProps>
}
