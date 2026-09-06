import { Request, Response } from "express"
import success from "@/common/utils/success"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import {
  IAcceptInvitationUseCase,
  ICancelInvitationUseCase,
  IGetOwnerManagersUseCase,
  IGetOwnerInvitationsUseCase,
  IInviteManagerUseCase,
  IRejectInvitationUseCase,
  IResendInvitationUseCase,
  IUpdateManagerPermissionsUseCase,
  ISuspendManagerUseCase,
  IReactivateManagerUseCase,
  IRemoveManagerUseCase,
  IGetManagedStationUseCase,
  IVerifyInvitationTokenUseCase,
  ISelfAssignManagerUseCase,
} from "../application/interfaces/manager-usecases.interface"

export class ManagerController {
  constructor(
    private readonly inviteManagerUseCase: IInviteManagerUseCase,
    private readonly acceptInvitationUseCase: IAcceptInvitationUseCase,
    private readonly rejectInvitationUseCase: IRejectInvitationUseCase,
    private readonly cancelInvitationUseCase: ICancelInvitationUseCase,
    private readonly resendInvitationUseCase: IResendInvitationUseCase,
    private readonly getOwnerManagersUseCase: IGetOwnerManagersUseCase,
    private readonly getOwnerInvitationsUseCase: IGetOwnerInvitationsUseCase,
    private readonly updateManagerPermissionsUseCase: IUpdateManagerPermissionsUseCase,
    private readonly suspendManagerUseCase: ISuspendManagerUseCase,
    private readonly reactivateManagerUseCase: IReactivateManagerUseCase,
    private readonly removeManagerUseCase: IRemoveManagerUseCase,
    private readonly getManagedStationUseCase: IGetManagedStationUseCase,
    private readonly verifyInvitationTokenUseCase: IVerifyInvitationTokenUseCase,
    private readonly selfAssignManagerUseCase: ISelfAssignManagerUseCase
  ) {}

  invite = async (req: AuthenticatedRequest, res: Response) => {
    const ownerUserId = req.user!.userId
    const result = await this.inviteManagerUseCase.execute(ownerUserId, req.body)
    success(res, result, HTTP_STATUS.CREATED, result.message)
  }

  selfAssignManager = async (req: AuthenticatedRequest, res: Response) => {
    const ownerUserId = req.user!.userId
    const { stationId } = req.body
    const result = await this.selfAssignManagerUseCase.execute({ ownerUserId, stationId })
    success(res, result, HTTP_STATUS.CREATED, "")
  }

  getOwnerManagers = async (req: AuthenticatedRequest, res: Response) => {
    const ownerUserId = req.user!.userId
    const { stationId, status, search, page, limit } = req.query
    const result = await this.getOwnerManagersUseCase.execute(ownerUserId, {
      stationId: stationId as string,
      status: status as string,
      search: search as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    })
    success(res, result, HTTP_STATUS.OK, "Managers retrieved successfully")
  }

  getOwnerInvitations = async (req: AuthenticatedRequest, res: Response) => {
    const ownerUserId = req.user!.userId
    const invitations = await this.getOwnerInvitationsUseCase.execute(ownerUserId)
    success(res, invitations, HTTP_STATUS.OK, "Invitations retrieved successfully")
  }

  updatePermissions = async (req: AuthenticatedRequest, res: Response) => {
    const ownerUserId = req.user!.userId
    const assignmentId = (req.params.managerId || req.params.assignmentId) as string
    const { permissions } = req.body
    const updated = await this.updateManagerPermissionsUseCase.execute(
      ownerUserId,
      assignmentId,
      permissions
    )
    success(res, updated, HTTP_STATUS.OK, "Manager permissions updated successfully")
  }

  suspend = async (req: AuthenticatedRequest, res: Response) => {
    const ownerUserId = req.user!.userId
    const assignmentId = (req.params.managerId || req.params.assignmentId) as string
    const updated = await this.suspendManagerUseCase.execute(ownerUserId, assignmentId)
    success(res, updated, HTTP_STATUS.OK, "Manager suspended successfully")
  }

  reactivate = async (req: AuthenticatedRequest, res: Response) => {
    const ownerUserId = req.user!.userId
    const assignmentId = (req.params.managerId || req.params.assignmentId) as string
    const updated = await this.reactivateManagerUseCase.execute(ownerUserId, assignmentId)
    success(res, updated, HTTP_STATUS.OK, "Manager reactivated successfully")
  }

  remove = async (req: AuthenticatedRequest, res: Response) => {
    const ownerUserId = req.user!.userId
    const assignmentId = (req.params.managerId || req.params.assignmentId) as string
    await this.removeManagerUseCase.execute(ownerUserId, assignmentId)
    success(res, null, HTTP_STATUS.OK, "Manager assignment removed successfully")
  }

  resendInvitation = async (req: AuthenticatedRequest, res: Response) => {
    const ownerUserId = req.user!.userId
    const invitationId = req.params.invitationId as string
    const invitation = await this.resendInvitationUseCase.execute(ownerUserId, invitationId)
    success(res, invitation, HTTP_STATUS.OK, "Invitation resent successfully")
  }

  cancelInvitation = async (req: AuthenticatedRequest, res: Response) => {
    const ownerUserId = req.user!.userId
    const invitationId = req.params.invitationId as string
    await this.cancelInvitationUseCase.execute(ownerUserId, invitationId)
    success(res, null, HTTP_STATUS.OK, "Invitation cancelled successfully")
  }

  verifyToken = async (req: Request, res: Response) => {
    const token = req.query.token as string
    const invitation = await this.verifyInvitationTokenUseCase.execute(token)
    success(res, invitation, HTTP_STATUS.OK, "Invitation token is valid")
  }

  acceptInvitation = async (req: Request, res: Response) => {
    const result = await this.acceptInvitationUseCase.execute(req.body)
    success(res, result, HTTP_STATUS.OK, result.message)
  }

  rejectInvitation = async (req: Request, res: Response) => {
    const { token } = req.body
    await this.rejectInvitationUseCase.execute(token)
    success(res, null, HTTP_STATUS.OK, "Invitation rejected successfully")
  }

  getManagedStations = async (req: AuthenticatedRequest, res: Response) => {
    const managerUserId = req.user!.userId
    const stations = await this.getManagedStationUseCase.execute(managerUserId)
    success(res, stations, HTTP_STATUS.OK, "Managed stations retrieved successfully")
  }
}
