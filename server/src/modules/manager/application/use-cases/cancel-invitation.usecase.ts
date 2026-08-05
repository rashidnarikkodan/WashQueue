import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { BadRequestError } from "@/common/errors/bad-request-error"
import { IManagerInvitationRepository } from "../../domain/repositories/manager-invitation.repository"
import { ICancelInvitationUseCase } from "../interfaces/manager-usecases.interface"

import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"

export class CancelInvitationUseCase implements ICancelInvitationUseCase {
  constructor(
    private readonly managerInvitationRepository: IManagerInvitationRepository,
    private readonly ownerRepository: IOwnerRepository
  ) {}

  async execute(ownerUserId: string, invitationId: string): Promise<void> {
    const invitation = await this.managerInvitationRepository.findById(invitationId)
    if (!invitation) {
      throw new NotFoundError("Invitation not found")
    }

    const owner = await this.ownerRepository.findByUserId(ownerUserId)
    const isOwner =
      invitation.ownerId.toString() === ownerUserId.toString() ||
      (Boolean(owner?.id) && invitation.ownerId.toString() === owner!.id)

    if (!isOwner) {
      throw new ForbiddenError("You do not have permission to cancel this invitation")
    }

    if (!invitation.isPending) {
      throw new BadRequestError(`Only pending invitations can be cancelled (status: ${invitation.status})`)
    }

    invitation.cancel()
    await this.managerInvitationRepository.update(invitation)
  }
}
