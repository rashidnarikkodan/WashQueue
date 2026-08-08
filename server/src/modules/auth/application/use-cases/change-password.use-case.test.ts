import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { ChangePasswordUseCase } from "./change-password.use-case"
import { User } from "@/modules/user/domain/entities/User"
import { IUserRepository } from "@/modules/user/domain/repositories/user.repository"
import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token.repository"
import { RefreshToken } from "../../domain/entities/refresh-token.entity"
import { IHashService } from "../interfaces"
import { AppError } from "@/common/errors/app-error"
import { ROLE } from "@/common/constants/role.constants"
import { AUTH_PROVIDER } from "@/common/constants/authProvider"

class MockUserRepository implements IUserRepository {
  public mockUser: User | null = null
  public updatedPasswordHash: string | null = null
  public shouldFail = false

  async findById(id: string): Promise<User | null> {
    if (this.shouldFail) {
      throw new Error("Database connection error")
    }
    if (this.mockUser && this.mockUser.id === id) {
      return this.mockUser
    }
    return null
  }

  async findByEmail(): Promise<User | null> {
    return null
  }

  async recordLoginSuccess(): Promise<void> {}
  async verifyUserAndSaveSession(): Promise<void> {}
  async updateRefreshToken(): Promise<void> {}
  async clearRefreshToken(): Promise<void> {}

  async resetPassword(userId: string, passwordHash: string): Promise<void> {
    if (this.shouldFail) {
      throw new Error("Database update error")
    }
    this.updatedPasswordHash = passwordHash
  }

  async updateRole(): Promise<void> {}
  async getAllUsers(): Promise<any> {
    return {}
  }
  async toggleBookmark(): Promise<User | null> {
    return null
  }
  async save(user: User): Promise<User> {
    return user
  }
  async update(id: string, updates: Partial<User>): Promise<User | null> {
    return null
  }
  async delete(id: string): Promise<void> {}
}

class MockRefreshTokenRepository implements IRefreshTokenRepository {
  public clearedUserId: string | null = null
  public savedTokens: Map<string, string> = new Map()

  async save(userId: string, token: RefreshToken): Promise<void> {
    this.savedTokens.set(userId, token.token)
  }

  async findByUserId(userId: string): Promise<RefreshToken | null> {
    const token = this.savedTokens.get(userId)
    return token ? new RefreshToken(token) : null
  }

  async clear(userId: string): Promise<void> {
    this.clearedUserId = userId
    this.savedTokens.delete(userId)
  }
}

class MockHashService implements IHashService {
  async hash(plain: string): Promise<string> {
    return `argon2id$mock$${plain}`
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    return hash === `argon2id$mock$${plain}` || hash === plain
  }
}

function createDummyUser(props: Partial<User> = {}): User {
  return new User({
    id: "650000000000000000000010",
    email: "user@washqueue.com",
    name: "Test User",
    password: "argon2id$mock$CurrentPassword123!",
    role: ROLE.CUSTOMER,
    authProvider: AUTH_PROVIDER.LOCAL,
    isBlocked: false,
    isVerified: true,
    ...props,
  })
}

describe("ChangePasswordUseCase Unit Tests", () => {
  it("1. Successful password change: hashes new password, updates DB, and clears refresh token", async () => {
    const userRepo = new MockUserRepository()
    const refreshRepo = new MockRefreshTokenRepository()
    const hashService = new MockHashService()

    userRepo.mockUser = createDummyUser()
    refreshRepo.savedTokens.set("650000000000000000000010", "old_refresh_token_hash")

    const useCase = new ChangePasswordUseCase(userRepo, refreshRepo, hashService)

    await useCase.execute("650000000000000000000010", {
      currentPassword: "CurrentPassword123!",
      newPassword: "NewSecretPassword456!",
    })

    assert.equal(userRepo.updatedPasswordHash, "argon2id$mock$NewSecretPassword456!")
    assert.equal(refreshRepo.clearedUserId, "650000000000000000000010")
    assert.equal(refreshRepo.savedTokens.has("650000000000000000000010"), false)
  })

  it("2. Wrong current password: throws 400 Bad Request", async () => {
    const userRepo = new MockUserRepository()
    const refreshRepo = new MockRefreshTokenRepository()
    const hashService = new MockHashService()

    userRepo.mockUser = createDummyUser()

    const useCase = new ChangePasswordUseCase(userRepo, refreshRepo, hashService)

    await assert.rejects(
      async () => {
        await useCase.execute("650000000000000000000010", {
          currentPassword: "WrongPassword!",
          newPassword: "NewSecretPassword456!",
        })
      },
      (err: unknown) => {
        return err instanceof AppError && err.statusCode === 400 && err.message === "Incorrect current password"
      }
    )
  })

  it("3. Invalid new password (under 8 chars): throws 400 Bad Request", async () => {
    const userRepo = new MockUserRepository()
    const refreshRepo = new MockRefreshTokenRepository()
    const hashService = new MockHashService()

    userRepo.mockUser = createDummyUser()

    const useCase = new ChangePasswordUseCase(userRepo, refreshRepo, hashService)

    await assert.rejects(
      async () => {
        await useCase.execute("650000000000000000000010", {
          currentPassword: "CurrentPassword123!",
          newPassword: "short",
        })
      },
      (err: unknown) => {
        return err instanceof AppError && err.statusCode === 400 && err.message === "Password must be at least 8 characters"
      }
    )
  })

  it("4. Same current and new password: throws 400 Bad Request", async () => {
    const userRepo = new MockUserRepository()
    const refreshRepo = new MockRefreshTokenRepository()
    const hashService = new MockHashService()

    userRepo.mockUser = createDummyUser()

    const useCase = new ChangePasswordUseCase(userRepo, refreshRepo, hashService)

    await assert.rejects(
      async () => {
        await useCase.execute("650000000000000000000010", {
          currentPassword: "CurrentPassword123!",
          newPassword: "CurrentPassword123!",
        })
      },
      (err: unknown) => {
        return (
          err instanceof AppError &&
          err.statusCode === 400 &&
          err.message === "New password cannot be the same as current password"
        )
      }
    )
  })

  it("5. Unauthenticated request (missing userId): throws 401 Unauthorized", async () => {
    const userRepo = new MockUserRepository()
    const refreshRepo = new MockRefreshTokenRepository()
    const hashService = new MockHashService()

    const useCase = new ChangePasswordUseCase(userRepo, refreshRepo, hashService)

    await assert.rejects(
      async () => {
        await useCase.execute("", {
          currentPassword: "CurrentPassword123!",
          newPassword: "NewSecretPassword456!",
        })
      },
      (err: unknown) => {
        return err instanceof AppError && err.statusCode === 401
      }
    )
  })

  it("6. Blocked user: throws 403 Forbidden", async () => {
    const userRepo = new MockUserRepository()
    const refreshRepo = new MockRefreshTokenRepository()
    const hashService = new MockHashService()

    userRepo.mockUser = createDummyUser({ isBlocked: true })

    const useCase = new ChangePasswordUseCase(userRepo, refreshRepo, hashService)

    await assert.rejects(
      async () => {
        await useCase.execute("650000000000000000000010", {
          currentPassword: "CurrentPassword123!",
          newPassword: "NewSecretPassword456!",
        })
      },
      (err: unknown) => {
        return err instanceof AppError && err.statusCode === 403
      }
    )
  })

  it("7. Refresh-token / session invalidation: verifies active session token cleared", async () => {
    const userRepo = new MockUserRepository()
    const refreshRepo = new MockRefreshTokenRepository()
    const hashService = new MockHashService()

    userRepo.mockUser = createDummyUser()
    refreshRepo.savedTokens.set("650000000000000000000010", "valid_session_token_hash")

    const useCase = new ChangePasswordUseCase(userRepo, refreshRepo, hashService)

    await useCase.execute("650000000000000000000010", {
      currentPassword: "CurrentPassword123!",
      newPassword: "NewSecretPassword456!",
    })

    const tokenAfter = await refreshRepo.findByUserId("650000000000000000000010")
    assert.equal(tokenAfter, null)
  })

  it("8. Database failure: propagates exception cleanly", async () => {
    const userRepo = new MockUserRepository()
    const refreshRepo = new MockRefreshTokenRepository()
    const hashService = new MockHashService()

    userRepo.mockUser = createDummyUser()
    userRepo.shouldFail = true

    const useCase = new ChangePasswordUseCase(userRepo, refreshRepo, hashService)

    await assert.rejects(
      async () => {
        await useCase.execute("650000000000000000000010", {
          currentPassword: "CurrentPassword123!",
          newPassword: "NewSecretPassword456!",
        })
      },
      (err: unknown) => {
        return err instanceof Error && err.message === "Database connection error"
      }
    )
  })
})
