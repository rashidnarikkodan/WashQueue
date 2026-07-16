import { GetUsersUseCase } from "./application/use-cases/get-users.use-case"
import { GetUserUseCase } from "./application/use-cases/get-user.use-case"
import { UpdateUserUseCase } from "./application/use-cases/update-user.use-case"
import { UserRepository } from "./infrastructure/repository/user.mongo.repository"
import { UserController } from "./presentation/user.controller"
import { createUsersRouter } from "./presentation/user.routes"
import { OwnerMongoRepository } from "../owner/infrastructure/repository/owner.mongo.repository"
import { RedisCacheService } from "@/infrastructure/cache/redis-cache.service"
import { MailService } from "../auth/infrastructure/services/mail.service"

// infrastructures
export const userRepository = new UserRepository()
const ownerRepository = new OwnerMongoRepository()
const cacheService = new RedisCacheService()
const mailService = new MailService()

// use cases
const getUsersUseCase = new GetUsersUseCase(userRepository)
const getUserUseCase = new GetUserUseCase(userRepository, ownerRepository)
const updateUserUseCase = new UpdateUserUseCase(
  userRepository,
  cacheService,
  ownerRepository,
  mailService
)

// presentation
const userController = new UserController(getUsersUseCase, getUserUseCase, updateUserUseCase)
const router = createUsersRouter(userController)

export default router
