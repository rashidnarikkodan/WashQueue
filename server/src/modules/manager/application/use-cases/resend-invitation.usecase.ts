import crypto from "crypto"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { IManagerInvitationRepository } from "../../domain/repositories/manager-invitation.repository"
import { ManagerInvitation, ManagerInvitationStatus } from "../../domain/entities/ManagerInvitation"
import { IResendInvitationUseCase } from "../interfaces/manager-usecases.interface"

import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { IStationRepository } from "@/modules/station/domain/repositories/station.repository"
import { IMailService } from "@/core/application/interfaces/mail.interface"

export class ResendInvitationUseCase implements IResendInvitationUseCase {
  constructor(
    private readonly managerInvitationRepository: IManagerInvitationRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly stationRepository: IStationRepository,
    private readonly mailService?: IMailService
  ) {}

  async execute(ownerUserId: string, invitationId: string): Promise<ManagerInvitation> {
    const invitation = await this.managerInvitationRepository.findById(invitationId)
    if (!invitation) {
      throw new NotFoundError("Invitation not found")
    }

    const owner = await this.ownerRepository.findByUserId(ownerUserId)
    const isOwner =
      invitation.ownerId.toString() === ownerUserId.toString() ||
      (Boolean(owner?.id) && invitation.ownerId.toString() === owner!.id)

    if (!isOwner) {
      throw new ForbiddenError("You do not have permission to resend this invitation")
    }

    const newToken = crypto.randomBytes(32).toString("hex")
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const updatedInvitation = new ManagerInvitation({
      id: invitation.id,
      email: invitation.email,
      name: invitation.name,
      stationId: invitation.stationId,
      ownerId: invitation.ownerId,
      permissions: invitation.permissions,
      token: newToken,
      status: ManagerInvitationStatus.PENDING,
      expiresAt: newExpiresAt,
      createdAt: invitation.createdAt,
    })

    const saved = await this.managerInvitationRepository.update(updatedInvitation)

    if (this.mailService) {
      const station = await this.stationRepository.findById(invitation.stationId)
      await this.mailService.sendManagerInvitationEmail(invitation.email, {
        managerName: invitation.name,
        stationName: station?.getProps().name || "Wash Station",
        token: newToken,
      })
    }

    return saved
  }
}
