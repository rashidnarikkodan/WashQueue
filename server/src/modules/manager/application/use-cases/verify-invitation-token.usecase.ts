import { NotFoundError } from "@/common/errors/not-found-error"
import { BadRequestError } from "@/common/errors/bad-request-error"
import { IManagerInvitationRepository } from "../../domain/repositories/manager-invitation.repository"
import { ManagerInvitation } from "../../domain/entities/ManagerInvitation"
import { IVerifyInvitationTokenUseCase } from "../interfaces/manager-usecases.interface"

export class VerifyInvitationTokenUseCase implements IVerifyInvitationTokenUseCase {
  constructor(private readonly managerInvitationRepository: IManagerInvitationRepository) {}

  async execute(token: string): Promise<ManagerInvitation> {
    const invitation = await this.managerInvitationRepository.findByToken(token)
    if (!invitation) {
      throw new NotFoundError("Invitation token not found")
    }

    if (invitation.isExpired) {
      throw new BadRequestError("Invitation token has expired")
    }

    if (!invitation.isPending) {
      throw new BadRequestError(`Invitation is no longer valid (status: ${invitation.status})`)
    }

    return invitation
  }
}
