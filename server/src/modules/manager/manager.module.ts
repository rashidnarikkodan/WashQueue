import { Router } from "express"
import { UserRepository } from "@/modules/user/infrastructure/repository/user.mongo.repository"
import { StationMongoRepository } from "@/modules/station/infrastructure/repositories/station.mongo.repository"
import { MongoManagerAssignmentRepository } from "./infrastructure/repositories/manager-assignment.mongo.repository"
import { MongoManagerInvitationRepository } from "./infrastructure/repositories/manager-invitation.mongo.repository"

import { InviteManagerUseCase } from "./application/use-cases/invite-manager.usecase"
import { AcceptInvitationUseCase } from "./application/use-cases/accept-invitation.usecase"
import { RejectInvitationUseCase } from "./application/use-cases/reject-invitation.usecase"
import { CancelInvitationUseCase } from "./application/use-cases/cancel-invitation.usecase"
import { ResendInvitationUseCase } from "./application/use-cases/resend-invitation.usecase"
import { GetOwnerManagersUseCase } from "./application/use-cases/get-owner-managers.usecase"
import { GetOwnerInvitationsUseCase } from "./application/use-cases/get-owner-invitations.usecase"
import { UpdateManagerPermissionsUseCase } from "./application/use-cases/update-manager-permissions.usecase"
import { SuspendManagerUseCase } from "./application/use-cases/suspend-manager.usecase"
import { ReactivateManagerUseCase } from "./application/use-cases/reactivate-manager.usecase"
import { RemoveManagerUseCase } from "./application/use-cases/remove-manager.usecase"
import { GetManagedStationsUseCase } from "./application/use-cases/get-managed-stations.usecase"
import { VerifyInvitationTokenUseCase } from "./application/use-cases/verify-invitation-token.usecase"

import { ManagerController } from "./presentation/controllers/manager.controller"
import { createManagerRouter } from "./presentation/routes/manager.routes"
import { createRequireManagerPermissionMiddleware } from "./presentation/middleware/require-manager-permission.middleware"

import { OwnerMongoRepository } from "@/modules/owner/infrastructure/repository/owner.mongo.repository"
import { mailService } from "@/modules/auth/auth.module"

// Repositories
const userRepository = new UserRepository()
const stationRepository = new StationMongoRepository()
const managerAssignmentRepository = new MongoManagerAssignmentRepository()
const managerInvitationRepository = new MongoManagerInvitationRepository()
const ownerRepository = new OwnerMongoRepository()

// Use Cases
const inviteManagerUseCase = new InviteManagerUseCase(
  stationRepository,
  userRepository,
  managerAssignmentRepository,
  managerInvitationRepository,
  ownerRepository,
  mailService
)

const acceptInvitationUseCase = new AcceptInvitationUseCase(
  managerInvitationRepository,
  managerAssignmentRepository,
  userRepository
)

const rejectInvitationUseCase = new RejectInvitationUseCase(managerInvitationRepository)

const cancelInvitationUseCase = new CancelInvitationUseCase(
  managerInvitationRepository,
  ownerRepository
)

const resendInvitationUseCase = new ResendInvitationUseCase(
  managerInvitationRepository,
  ownerRepository,
  stationRepository,
  mailService
)

const getOwnerManagersUseCase = new GetOwnerManagersUseCase(
  managerAssignmentRepository,
  userRepository,
  stationRepository
)

const getOwnerInvitationsUseCase = new GetOwnerInvitationsUseCase(managerInvitationRepository)

const updateManagerPermissionsUseCase = new UpdateManagerPermissionsUseCase(
  managerAssignmentRepository,
  ownerRepository
)

const suspendManagerUseCase = new SuspendManagerUseCase(
  managerAssignmentRepository,
  ownerRepository
)

const reactivateManagerUseCase = new ReactivateManagerUseCase(
  managerAssignmentRepository,
  ownerRepository
)

const removeManagerUseCase = new RemoveManagerUseCase(
  managerAssignmentRepository,
  userRepository,
  ownerRepository
)

const getManagedStationsUseCase = new GetManagedStationsUseCase(
  managerAssignmentRepository,
  stationRepository
)

const verifyInvitationTokenUseCase = new VerifyInvitationTokenUseCase(managerInvitationRepository)

// Controller
const managerController = new ManagerController(
  inviteManagerUseCase,
  acceptInvitationUseCase,
  rejectInvitationUseCase,
  cancelInvitationUseCase,
  resendInvitationUseCase,
  getOwnerManagersUseCase,
  getOwnerInvitationsUseCase,
  updateManagerPermissionsUseCase,
  suspendManagerUseCase,
  reactivateManagerUseCase,
  removeManagerUseCase,
  getManagedStationsUseCase,
  verifyInvitationTokenUseCase
)

// Middleware factory
export const requireManagerPermission = createRequireManagerPermissionMiddleware(
  managerAssignmentRepository,
  stationRepository
)

// Export Router
const managerRouter: Router = createManagerRouter(managerController)
export default managerRouter
