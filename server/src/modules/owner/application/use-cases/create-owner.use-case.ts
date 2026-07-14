import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ROLE } from "@/common/constants/role.constants"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { Owner } from "../../domain/entities/Owner"
import { IOwnerRepository } from "../../domain/repositories/owner.repository"
import { CreateOwnerInput } from "../dto/create-owner.dto"
import { ICreateOwnerUseCase } from "../interfaces/owner-usecases.interfaces"

export class CreateOwnerUseCase implements ICreateOwnerUseCase {
  constructor(
    private readonly ownerRepository: IOwnerRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: CreateOwnerInput): Promise<Owner> {
    // 1. Verify user exists
    const user = await this.userRepository.findById(input.userId)
    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND)
    }

    // 2. Check if owner profile already exists for this user
    const existingOwner = await this.ownerRepository.findByUserId(input.userId)
    if (existingOwner) {
      throw new AppError("Owner profile already exists for this user", HTTP_STATUS.CONFLICT)
    }

    // 3. Create the owner entity
    const owner = new Owner({
      userId: input.userId,
      legalFullName: input.legalFullName,
      businessName: input.businessName,
      gstNumber: input.gstNumber,
      whatsapp: input.whatsapp,
      businessEmail: input.businessEmail,
      isVerified: false,
    })

    const savedOwner = await this.ownerRepository.save(owner)

    // 4. Update user's role to ROLE.OWNER
    await this.userRepository.updateRole(input.userId, ROLE.OWNER)

    return savedOwner
  }
}
