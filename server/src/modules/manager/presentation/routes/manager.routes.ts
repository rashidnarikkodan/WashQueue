import { Router } from "express"
import { ManagerController } from "../controllers/manager.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { authorize } from "@/infrastructure/http/middleware/authorize"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import {
  inviteManagerSchema,
  acceptInvitationSchema,
  updatePermissionsSchema,
} from "../schemas/manager.schema"

export const createManagerRouter = (managerController: ManagerController): Router => {
  const router = Router()

  // Public Invitation endpoints
  router.get("/invitations/verify", asyncHandler(managerController.verifyToken))
  router.post(
    "/invitations/accept",
    validateRequest(acceptInvitationSchema),
    asyncHandler(managerController.acceptInvitation)
  )
  router.post("/invitations/reject", asyncHandler(managerController.rejectInvitation))

  // Authenticated routes
  router.use(authenticate)

  // Manager self routes
  router.get("/my-stations", asyncHandler(managerController.getManagedStations))

  // Owner manager management routes (Owner or Admin)
  router.post(
    "/invite",
    authorize("owner", "admin"),
    validateRequest(inviteManagerSchema),
    asyncHandler(managerController.invite)
  )

  router.get("/", authorize("owner", "admin"), asyncHandler(managerController.getOwnerManagers))
  router.get(
    "/invitations",
    authorize("owner", "admin"),
    asyncHandler(managerController.getOwnerInvitations)
  )

  router.patch(
    "/:assignmentId/permissions",
    authorize("owner", "admin"),
    validateRequest(updatePermissionsSchema),
    asyncHandler(managerController.updatePermissions)
  )

  router.patch(
    "/:assignmentId/suspend",
    authorize("owner", "admin"),
    asyncHandler(managerController.suspend)
  )

  router.patch(
    "/:assignmentId/reactivate",
    authorize("owner", "admin"),
    asyncHandler(managerController.reactivate)
  )

  router.delete(
    "/:assignmentId",
    authorize("owner", "admin"),
    asyncHandler(managerController.remove)
  )

  router.post(
    "/invitations/:invitationId/resend",
    authorize("owner", "admin"),
    asyncHandler(managerController.resendInvitation)
  )

  router.delete(
    "/invitations/:invitationId",
    authorize("owner", "admin"),
    asyncHandler(managerController.cancelInvitation)
  )

  return router
}
