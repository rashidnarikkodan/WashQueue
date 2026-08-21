import { GetUsersUseCase } from "./application/use-cases/get-users.use-case"
import { GetUserUseCase } from "./application/use-cases/get-user.use-case"
import { UpdateUserUseCase } from "./application/use-cases/update-user.use-case"
import { GetBookmarksUseCase } from "./application/use-cases/get-bookmarks.use-case"
import { ToggleBookmarkUseCase } from "./application/use-cases/toggle-bookmark.use-case"
import { UserRepository } from "./infrastructure/repository/user.mongo.repository"
import { UserController } from "./presentation/user.controller"
import { createUsersRouter } from "./presentation/user.routes"
import { OwnerMongoRepository } from "../owner/infrastructure/repository/owner.mongo.repository"
import { OwnerVerificationStatusService } from "../owner/application/use-cases/owner-verification-status.service"
import { stationRepository } from "../station/station.module"
import { RedisCacheService } from "@/infrastructure/cache/redis-cache.service"
import { MailService } from "../../core/application/services/mail.service"

export const userRepository = new UserRepository()
const ownerRepository = new OwnerMongoRepository()
const cacheService = new RedisCacheService()
const mailService = new MailService()
const ownerVerificationStatusService = new OwnerVerificationStatusService(
  ownerRepository,
  mailService
)

const getUsersUseCase = new GetUsersUseCase(userRepository)
const getUserUseCase = new GetUserUseCase(userRepository, ownerRepository)
const updateUserUseCase = new UpdateUserUseCase(
  userRepository,
  cacheService,
  ownerVerificationStatusService
)
const getBookmarksUseCase = new GetBookmarksUseCase(userRepository, stationRepository)
const toggleBookmarkUseCase = new ToggleBookmarkUseCase(userRepository)

const userController = new UserController(
  getUsersUseCase,
  getUserUseCase,
  updateUserUseCase,
  getBookmarksUseCase,
  toggleBookmarkUseCase
)
const router = createUsersRouter(userController)

export default router
