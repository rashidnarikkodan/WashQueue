import { Owner } from "../../domain/entities/Owner"
import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { IGetOwnerUseCase } from "../interfaces/owner-usecases.interfaces"

export class GetOwnerUseCase implements IGetOwnerUseCase {
  constructor(private readonly ownerRepository: IOwnerRepository) {}

  async execute(userId: string): Promise<Owner | null> {
    return this.ownerRepository.findByUserId(userId)
  }
}
