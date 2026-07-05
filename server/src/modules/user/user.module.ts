import { GetUsersUseCase } from "./application/use-cases/get-users.use-case";
import { GetUserUseCase } from "./application/use-cases/get-user.use-case";
import { UpdateUserUseCase } from "./application/use-cases/update-user.use-case";
import { UserRepository } from "./infrastructure/repository/user.repository";
import { UserController } from "./presentation/user.controller";
import { createUsersRouter } from "./presentation/user.routes";
import { RedisCacheService } from "@/infrastructure/cache/redis-cache.service";

// infrastructures
export const userRepository = new UserRepository()
const cacheService = new RedisCacheService()

// use cases
const getUsersUseCase = new GetUsersUseCase(userRepository)
const getUserUseCase = new GetUserUseCase(userRepository)
const updateUserUseCase = new UpdateUserUseCase(userRepository, cacheService)

// presentation
const userController = new UserController(
  getUsersUseCase,
  getUserUseCase,
  updateUserUseCase
)
const router = createUsersRouter(userController)

export default router