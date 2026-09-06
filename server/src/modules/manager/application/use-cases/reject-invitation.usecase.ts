import { NotFoundError } from "@/common/errors/not-found-error"
import { BadRequestError } from "@/common/errors/bad-request-error"
import { IManagerInvitationRepository } from "../../domain/repositories/manager-invitation.repository"
import { IRejectInvitationUseCase } from "../interfaces/manager-usecases.interface"

export class RejectInvitationUseCase implements IRejectInvitationUseCase {
  constructor(private readonly managerInvitationRepository: IManagerInvitationRepository) {}

  async execute(token: string): Promise<void> {
    const invitation = await this.managerInvitationRepository.findByToken(token)
    if (!invitation) {
      throw new NotFoundError("Invitation token not found")
    }

    if (!invitation.isPending) {
      throw new BadRequestError(`Invitation cannot be rejected (status: ${invitation.status})`)
    }

    invitation.reject()
    await this.managerInvitationRepository.update(invitation)
  }
}
