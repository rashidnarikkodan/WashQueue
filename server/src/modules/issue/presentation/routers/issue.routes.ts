import { Router } from "express"
import { IssueController } from "../controllers/issue.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { authorize } from "@/infrastructure/http/middleware/authorize"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import { ROLE } from "@/common/constants/role.constants"
import { API_ROUTES } from "@/common/constants/route.constants"
import {
  createIssueSchema,
  updateIssueStatusSchema,
  assignIssueSchema,
  escalateIssueSchema,
  resolveIssueSchema,
  closeIssueSchema,
  issueQuerySchema,
} from "../schemas/issue.schema"

export const createIssueRouter = (issueController: IssueController): Router => {
  const router = Router()

  router.post(
    API_ROUTES.ISSUES.CREATE,
    authenticate,
    authorize(ROLE.CUSTOMER, ROLE.OWNER),
    validateRequest(createIssueSchema, "body"),
    asyncHandler(issueController.create)
  )

  router.get(
    API_ROUTES.ISSUES.MY_ISSUES,
    authenticate,
    authorize(ROLE.CUSTOMER, ROLE.OWNER),
    validateRequest(issueQuerySchema, "query"),
    asyncHandler(issueController.getMyIssues)
  )

  router.get(
    API_ROUTES.ISSUES.BY_STATION,
    authenticate,
    authorize(ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(issueQuerySchema, "query"),
    asyncHandler(issueController.getStationIssues)
  )

  router.get(
    API_ROUTES.ISSUES.ADMIN_ALL,
    authenticate,
    authorize(ROLE.ADMIN),
    validateRequest(issueQuerySchema, "query"),
    asyncHandler(issueController.getAdminIssues)
  )

  router.get(
    API_ROUTES.ISSUES.BY_ID,
    authenticate,
    authorize(ROLE.CUSTOMER, ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    asyncHandler(issueController.getById)
  )

  router.patch(
    API_ROUTES.ISSUES.STATUS,
    authenticate,
    authorize(ROLE.MANAGER, ROLE.ADMIN),
    validateRequest(updateIssueStatusSchema, "body"),
    asyncHandler(issueController.updateStatus)
  )

  router.patch(
    API_ROUTES.ISSUES.ASSIGN,
    authenticate,
    authorize(ROLE.MANAGER, ROLE.ADMIN),
    validateRequest(assignIssueSchema, "body"),
    asyncHandler(issueController.assign)
  )

  router.post(
    API_ROUTES.ISSUES.ESCALATE,
    authenticate,
    authorize(ROLE.CUSTOMER, ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(escalateIssueSchema, "body"),
    asyncHandler(issueController.escalate)
  )

  router.post(
    API_ROUTES.ISSUES.RESOLVE,
    authenticate,
    authorize(ROLE.MANAGER, ROLE.ADMIN),
    validateRequest(resolveIssueSchema, "body"),
    asyncHandler(issueController.resolve)
  )

  router.post(
    API_ROUTES.ISSUES.CLOSE,
    authenticate,
    authorize(ROLE.CUSTOMER, ROLE.MANAGER, ROLE.OWNER, ROLE.ADMIN),
    validateRequest(closeIssueSchema, "body"),
    asyncHandler(issueController.close)
  )

  return router
}
