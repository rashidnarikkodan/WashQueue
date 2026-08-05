import { IManagerInvitationRepository } from "../../domain/repositories/manager-invitation.repository"
import { ManagerInvitation } from "../../domain/entities/ManagerInvitation"
import { IGetOwnerInvitationsUseCase } from "../interfaces/manager-usecases.interface"

export class GetOwnerInvitationsUseCase implements IGetOwnerInvitationsUseCase {
  constructor(private readonly managerInvitationRepository: IManagerInvitationRepository) {}

  async execute(ownerUserId: string): Promise<ManagerInvitation[]> {
    return await this.managerInvitationRepository.findByOwnerId(ownerUserId)
  }
}
