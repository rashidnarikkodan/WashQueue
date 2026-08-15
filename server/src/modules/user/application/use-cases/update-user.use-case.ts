import { IUserRepository } from "../../domain/repositories/user.repository"
import { User } from "../../domain/entities/User"
import { UpdateUserInput } from "../dto/update-user.dto"
import { IUpdateUserUseCase } from "../interfaces/user-usecases.interfaces"
import { ICacheService } from "@/core/application/interfaces/cache.interface"
import { IOwnerVerificationStatusService } from "@/modules/owner/application/interfaces/owner-verification-status.interface"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ROLE } from "@/common/constants/role.constants"

const BLOCKED_USER_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cacheService: ICacheService,
    private readonly ownerVerificationStatusService: IOwnerVerificationStatusService
  ) {}

  async execute(id: string, updates: UpdateUserInput): Promise<User | null> {
    const user = await this.userRepository.findById(id)
    if (!user) return null

    // Safety guard: admin accounts can never be blocked
    if (updates.isBlocked === true && user.role === ROLE.ADMIN) {
      throw new ForbiddenError("Admin accounts cannot be suspended")
    }

    const updatedUser = await this.userRepository.update(id, updates)

    if (updatedUser && typeof updates.isBlocked === "boolean") {
      const key = `blocked:${id}`
      try {
        if (updates.isBlocked) {
          // Blacklist user session. Set TTL to 30 days.
          await this.cacheService.set(key, "true", BLOCKED_USER_TTL_SECONDS)
        } else {
          await this.cacheService.del(key)
        }
      } catch (cacheError) {
        // Redis operation failed — roll back the DB change to keep them in sync
        await this.userRepository.update(id, { isBlocked: user.isBlocked })
        throw cacheError
      }
    }

    if (user.role === ROLE.OWNER) {
      await this.ownerVerificationStatusService.handleVerificationStatusChange({
        userId: id,
        userEmail: user.email,
        userName: user.name,
        updates: {
          isVerified: updates.isVerified,
          onboardingStep: updates.onboardingStep,
          rejectionReason: updates.rejectionReason,
          phone: updates.phone,
        },
      })
    }

    return updatedUser
  }
}
