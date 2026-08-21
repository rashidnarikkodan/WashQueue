import crypto from "crypto"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ConflictError } from "@/common/errors/conflict-error"
import { ROLE } from "@/common/constants/role.constants"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IManagerAssignmentRepository } from "../../domain/repositories/manager-assignment.repository"
import { IManagerInvitationRepository } from "../../domain/repositories/manager-invitation.repository"
import { ManagerAssignment, ManagerAssignmentStatus } from "../../domain/entities/ManagerAssignment"
import { ManagerInvitation, ManagerInvitationStatus } from "../../domain/entities/ManagerInvitation"
import {
  IInviteManagerUseCase,
  InviteManagerInput,
  InviteManagerResponse,
} from "../interfaces/manager-usecases.interface"

import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { IMailService } from "@/core/application/interfaces/mail.interface"

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: number }).code === 11000

export class InviteManagerUseCase implements IInviteManagerUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly userRepository: IUserRepository,
    private readonly managerAssignmentRepository: IManagerAssignmentRepository,
    private readonly managerInvitationRepository: IManagerInvitationRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly mailService?: IMailService
  ) {}

  async execute(ownerUserId: string, input: InviteManagerInput): Promise<InviteManagerResponse> {
    const station = await this.stationRepository.findById(input.stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    const owner = await this.ownerRepository.findByUserId(ownerUserId)
    const isOwner =
      station.ownerId.toString() === ownerUserId.toString() ||
      (Boolean(owner?.id) && station.ownerId.toString() === owner!.id)

    if (!isOwner) {
      throw new ForbiddenError("You do not have permission to manage this station")
    }

    const stationAssignments = await this.managerAssignmentRepository.findByStationId(
      input.stationId
    )
    const activeStationManager = stationAssignments.find(
      (a) => a.status === ManagerAssignmentStatus.ACTIVE
    )

    const email = input.email.toLowerCase().trim()
    const existingUser = await this.userRepository.findByEmail(email)

    if (activeStationManager) {
      if (!existingUser || activeStationManager.managerUserId !== existingUser.id) {
        throw new ConflictError(
          "This station already has an active manager assigned. A station can only have one manager."
        )
      }
    }

    const anyPendingInvitation = await this.managerInvitationRepository.findPendingByEmail(email)
    if (anyPendingInvitation && anyPendingInvitation.stationId !== input.stationId) {
      throw new ConflictError(
        "This email already has a pending manager invitation for another station. A manager can only be assigned to one station."
      )
    }

    if (existingUser && existingUser.id) {
      const userAssignments = await this.managerAssignmentRepository.findByUserId(existingUser.id)
      const otherActiveAssignment = userAssignments.find(
        (a) => a.stationId !== input.stationId && a.status === ManagerAssignmentStatus.ACTIVE
      )
      if (otherActiveAssignment) {
        throw new ConflictError(
          "This user is already managing another station. A manager can only be assigned to one station."
        )
      }

      const existingAssignment = await this.managerAssignmentRepository.findByUserAndStation(
        existingUser.id,
        input.stationId
      )

      if (existingAssignment) {
        if (existingAssignment.status === ManagerAssignmentStatus.ACTIVE) {
          throw new ConflictError("This user is already an active manager for this station")
        } else {
          existingAssignment.reactivate()
          existingAssignment.updatePermissions(input.permissions)
          try {
            const updated = await this.managerAssignmentRepository.update(existingAssignment)
            return {
              type: "ASSIGNED",
              assignment: updated,
              message: "Reactivated manager assignment for existing user",
            }
          } catch (error) {
            if (isDuplicateKeyError(error)) {
              throw new ConflictError(
                "This station or manager already has an active assignment (assigned concurrently by another request)"
              )
            }
            throw error
          }
        }
      }

      if (existingUser.role === ROLE.CUSTOMER) {
        await this.userRepository.updateRole(existingUser.id, ROLE.MANAGER)
      }

      const newAssignment = new ManagerAssignment({
        managerUserId: existingUser.id,
        stationId: input.stationId,
        ownerId: ownerUserId,
        permissions: input.permissions,
        status: ManagerAssignmentStatus.ACTIVE,
        assignedAt: new Date(),
      })

      try {
        const createdAssignment = await this.managerAssignmentRepository.create(newAssignment)

        return {
          type: "ASSIGNED",
          assignment: createdAssignment,
          message: "Manager assignment created successfully for existing user",
        }
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          throw new ConflictError(
            "This station or manager already has an active assignment (assigned concurrently by another request)"
          )
        }
        throw error
      }
    }

    const existingPendingInvitation = await this.managerInvitationRepository.findByEmailAndStation(
      email,
      input.stationId
    )

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    let createdInvitation: ManagerInvitation

    if (existingPendingInvitation) {
      if (!existingPendingInvitation.isExpired) {
        throw new ConflictError("A pending invitation already exists for this email and station")
      }

      const updated = new ManagerInvitation({
        id: existingPendingInvitation.id,
        email,
        name: input.name || existingPendingInvitation.name,
        stationId: input.stationId,
        ownerId: ownerUserId,
        permissions: input.permissions,
        token,
        status: ManagerInvitationStatus.PENDING,
        expiresAt,
        createdAt: existingPendingInvitation.createdAt,
      })
      createdInvitation = await this.managerInvitationRepository.update(updated)
    } else {
      const invitation = new ManagerInvitation({
        email,
        name: input.name,
        stationId: input.stationId,
        ownerId: ownerUserId,
        permissions: input.permissions,
        token,
        status: ManagerInvitationStatus.PENDING,
        expiresAt,
      })
      createdInvitation = await this.managerInvitationRepository.create(invitation)
    }

    if (this.mailService) {
      await this.mailService.sendManagerInvitationEmail(email, {
        managerName: input.name,
        stationName: station.getProps().name,
        token,
      })
    }

    return {
      type: "INVITED",
      invitation: createdInvitation,
      message: "Invitation link created and sent to user email",
    }
  }
}
