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
import { API_ROUTES } from "@/common/constants/route.constants"

export const createManagerRouter = (managerController: ManagerController): Router => {
  const router = Router()

  // Public invitation routes
  router.get(API_ROUTES.MANAGERS.VERIFY_INVITATION, asyncHandler(managerController.verifyToken))

  router.post(
    API_ROUTES.MANAGERS.ACCEPT_INVITATION,
    validateRequest(acceptInvitationSchema),
    asyncHandler(managerController.acceptInvitation)
  )

  router.post(
    API_ROUTES.MANAGERS.REJECT_INVITATION,
    asyncHandler(managerController.rejectInvitation)
  )

  // Authenticated routes
  router.use(authenticate)

  router.post(
    API_ROUTES.MANAGERS.INVITE,
    authorize("owner"),
    validateRequest(inviteManagerSchema),
    asyncHandler(managerController.invite)
  )

  router.get(
    API_ROUTES.MANAGERS.MY_STATIONS,
    authorize("manager"),
    asyncHandler(managerController.getManagedStations)
  )

  router.get(
    API_ROUTES.MANAGERS.LIST,
    authorize("owner", "admin"),
    asyncHandler(managerController.getOwnerManagers)
  )

  router.get(
    API_ROUTES.MANAGERS.LIST_INVITATIONS,
    authorize("owner", "admin"),
    asyncHandler(managerController.getOwnerInvitations)
  )

  router.patch(
    API_ROUTES.MANAGERS.UPDATE_PERMISSIONS,
    authorize("owner", "admin"),
    validateRequest(updatePermissionsSchema),
    asyncHandler(managerController.updatePermissions)
  )

  router.patch(
    API_ROUTES.MANAGERS.SUSPEND,
    authorize("owner", "admin"),
    asyncHandler(managerController.suspend)
  )

  router.patch(
    API_ROUTES.MANAGERS.REACTIVATE,
    authorize("owner", "admin"),
    asyncHandler(managerController.reactivate)
  )

  router.delete(
    API_ROUTES.MANAGERS.REMOVE,
    authorize("owner", "admin"),
    asyncHandler(managerController.remove)
  )

  router.post(
    API_ROUTES.MANAGERS.RESEND_INVITATION,
    authorize("owner", "admin"),
    asyncHandler(managerController.resendInvitation)
  )

  router.delete(
    API_ROUTES.MANAGERS.CANCEL_INVITATION,
    authorize("owner", "admin"),
    asyncHandler(managerController.cancelInvitation)
  )

  return router
}
