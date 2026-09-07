import { Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import success from "@/common/utils/success"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import { AppError } from "@/common/errors/app-error"
import { Issue } from "../../domain/entities/Issue"
import { IssueStatus } from "../../domain/value-objects/issue-status.vo"
import {
  ICreateIssueUseCase,
  IGetIssueByIdUseCase,
  IGetCustomerIssuesUseCase,
  IGetStationIssuesUseCase,
  IGetAdminIssuesUseCase,
  IUpdateIssueStatusUseCase,
  IAssignIssueUseCase,
  IResolveIssueUseCase,
  IEscalateIssueUseCase,
  ICloseIssueUseCase,
} from "../../application/interfaces/issue-usecases.interface"

interface IssueQueryParams {
  page?: number
  limit?: number
  status?: IssueStatus
  startDate?: Date
  endDate?: Date
  stationId?: string
  customerId?: string
}

export class IssueController {
  constructor(
    private readonly createIssueUseCase: ICreateIssueUseCase,
    private readonly getIssueByIdUseCase: IGetIssueByIdUseCase,
    private readonly getCustomerIssuesUseCase: IGetCustomerIssuesUseCase,
    private readonly getStationIssuesUseCase: IGetStationIssuesUseCase,
    private readonly getAdminIssuesUseCase: IGetAdminIssuesUseCase,
    private readonly updateIssueStatusUseCase: IUpdateIssueStatusUseCase,
    private readonly assignIssueUseCase: IAssignIssueUseCase,
    private readonly resolveIssueUseCase: IResolveIssueUseCase,
    private readonly escalateIssueUseCase: IEscalateIssueUseCase,
    private readonly closeIssueUseCase: ICloseIssueUseCase
  ) {}

  create = async (req: AuthenticatedRequest, res: Response) => {
    const customerId = req.user?.userId
    if (!customerId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const result = await this.createIssueUseCase.execute({
      ...req.body,
      customerId,
    })

    success(res, result.data, HTTP_STATUS.CREATED, "Issue reported successfully")
  }

  getMyIssues = async (req: AuthenticatedRequest, res: Response) => {
    const customerId = req.user?.userId
    if (!customerId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const query = req.query as IssueQueryParams
    const result = await this.getCustomerIssuesUseCase.execute(customerId, {
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
    })

    success(
      res,
      {
        issues: result.issues.map((i: Issue) => i.data),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      HTTP_STATUS.OK,
      "Customer issues retrieved successfully"
    )
  }

  getStationIssues = async (req: AuthenticatedRequest, res: Response) => {
    const stationId = req.params.stationId as string
    if (!stationId) {
      throw new AppError("stationId is required", HTTP_STATUS.BAD_REQUEST)
    }

    const query = req.query as IssueQueryParams
    const result = await this.getStationIssuesUseCase.execute(stationId, {
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
    })

    success(
      res,
      {
        issues: result.issues.map((i: Issue) => i.data),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      HTTP_STATUS.OK,
      "Station issues retrieved successfully"
    )
  }

  getAdminIssues = async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as IssueQueryParams
    const result = await this.getAdminIssuesUseCase.execute({
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      status: query.status,
      stationId: query.stationId,
      customerId: query.customerId,
      startDate: query.startDate,
      endDate: query.endDate,
    })

    success(
      res,
      {
        issues: result.issues.map((i: Issue) => i.data),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      HTTP_STATUS.OK,
      "Admin issues retrieved successfully"
    )
  }

  getById = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = req.params.id as string
    const userId = req.user?.userId
    const role = req.user?.role
    if (!userId || !role) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const issue = await this.getIssueByIdUseCase.execute(issueId, userId, role)
    success(res, issue.data, HTTP_STATUS.OK, "Issue retrieved successfully")
  }

  updateStatus = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = req.params.id as string
    const actionBy = req.user?.userId
    if (!actionBy) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const result = await this.updateIssueStatusUseCase.execute({
      issueId,
      actionBy,
      ...req.body,
    })

    success(res, result.data, HTTP_STATUS.OK, "Issue status updated successfully")
  }

  assign = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = req.params.id as string
    const assignedBy = req.user?.userId
    if (!assignedBy) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const result = await this.assignIssueUseCase.execute({
      issueId,
      managerId: req.body.managerId,
      assignedBy,
    })

    success(res, result.data, HTTP_STATUS.OK, "Manager assigned successfully")
  }

  escalate = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = req.params.id as string
    const escalatedBy = req.user?.userId
    if (!escalatedBy) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const result = await this.escalateIssueUseCase.execute({
      issueId,
      reason: req.body.reason,
      escalatedBy,
    })

    success(res, result.data, HTTP_STATUS.OK, "Issue escalated successfully")
  }

  resolve = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = req.params.id as string
    const resolvedBy = req.user?.userId
    if (!resolvedBy) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const result = await this.resolveIssueUseCase.execute({
      issueId,
      resolutionType: req.body.resolutionType,
      resolutionNotes: req.body.resolutionNotes,
      compensationAmount: req.body.compensationAmount,
      resolvedBy,
    })

    success(res, result.data, HTTP_STATUS.OK, "Issue resolved successfully")
  }

  close = async (req: AuthenticatedRequest, res: Response) => {
    const issueId = req.params.id as string
    const closedBy = req.user?.userId
    if (!closedBy) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const result = await this.closeIssueUseCase.execute({
      issueId,
      closedBy,
      notes: req.body.notes,
    })

    success(res, result.data, HTTP_STATUS.OK, "Issue closed successfully")
  }
}
