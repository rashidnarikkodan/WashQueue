import argon2 from "argon2"
import { NotFoundError } from "@/common/errors/not-found-error"
import { BadRequestError } from "@/common/errors/bad-request-error"
import { ROLE } from "@/common/constants/role.constants"
import { User } from "@/modules/user/domain/entities/User"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IManagerAssignmentRepository } from "../../domain/repositories/manager-assignment.repository"
import { IManagerInvitationRepository } from "../../domain/repositories/manager-invitation.repository"
import {
  ManagerAssignment,
  ManagerAssignmentStatus,
} from "../../domain/entities/ManagerAssignment"
import {
  IAcceptInvitationUseCase,
  AcceptInvitationInput,
} from "../interfaces/manager-usecases.interface"

export class AcceptInvitationUseCase implements IAcceptInvitationUseCase {
  constructor(
    private readonly managerInvitationRepository: IManagerInvitationRepository,
    private readonly managerAssignmentRepository: IManagerAssignmentRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: AcceptInvitationInput): Promise<{ message: string; user: { id: string; email: string; name?: string; role: string } }> {
    const invitation = await this.managerInvitationRepository.findByToken(input.token)
    if (!invitation) {
      throw new NotFoundError("Invitation token not found")
    }

    if (invitation.isExpired) {
      throw new BadRequestError("Invitation has expired")
    }

    if (!invitation.isPending) {
      throw new BadRequestError(`Invitation is no longer valid (status: ${invitation.status})`)
    }

    let user = await this.userRepository.findByEmail(invitation.email)

    if (!user) {
      if (!input.password) {
        throw new BadRequestError("Password is required for user registration")
      }
      const hashedPassword = await argon2.hash(input.password)

      const newUser = new User({
        email: invitation.email,
        name: input.name || invitation.name || "Manager",
        phone: input.phone,
        password: hashedPassword,
        role: ROLE.MANAGER,
        isVerified: true,
      })

      user = await this.userRepository.save(newUser)
    } else {
      if (user.role === ROLE.CUSTOMER && user.id) {
        await this.userRepository.updateRole(user.id, ROLE.MANAGER)
      }
    }

    if (!user || !user.id) {
      throw new BadRequestError("Failed to create or process user profile")
    }

    const userId = user.id

    // Check if user is already managing another active station
    const userAssignments = await this.managerAssignmentRepository.findByUserId(userId)
    const otherActiveAssignment = userAssignments.find(
      (a) => a.stationId !== invitation.stationId && a.status === ManagerAssignmentStatus.ACTIVE
    )
    if (otherActiveAssignment) {
      throw new BadRequestError("You are already managing another station. A manager can only be assigned to one station.")
    }

    // Accept invitation
    invitation.accept()
    await this.managerInvitationRepository.update(invitation)

    // Check if assignment already exists
    let assignment = await this.managerAssignmentRepository.findByUserAndStation(
      userId,
      invitation.stationId
    )

    if (assignment) {
      assignment.reactivate()
      assignment.updatePermissions(invitation.permissions)
      await this.managerAssignmentRepository.update(assignment)
    } else {
      assignment = new ManagerAssignment({
        managerUserId: userId,
        stationId: invitation.stationId,
        ownerId: invitation.ownerId,
        permissions: invitation.permissions,
        status: ManagerAssignmentStatus.ACTIVE,
        assignedAt: new Date(),
      })
      await this.managerAssignmentRepository.create(assignment)
    }

    return {
      message: "Invitation accepted successfully",
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: ROLE.MANAGER,
      },
    }
  }
}
