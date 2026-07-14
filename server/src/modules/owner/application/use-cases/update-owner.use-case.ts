import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { Owner } from "../../domain/entities/Owner"
import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { UpdateOwnerInput } from "../dto/update-owner.dto"
import { IUpdateOwnerUseCase } from "../interfaces/owner-usecases.interfaces"

export class UpdateOwnerUseCase implements IUpdateOwnerUseCase {
  constructor(private readonly ownerRepository: IOwnerRepository) {}

  async execute(userId: string, input: UpdateOwnerInput): Promise<Owner | null> {
    const owner = await this.ownerRepository.findByUserId(userId)
    if (!owner || !owner.id) {
      throw new AppError("Owner profile not found", HTTP_STATUS.NOT_FOUND)
    }

    return this.ownerRepository.update(owner.id, input)
  }
}
