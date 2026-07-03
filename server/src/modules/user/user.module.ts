import { GetUsersUseCase } from "./application/use-cases/get-users";
import { GetUserUseCase } from "./application/use-cases/get-user";
import { UpdateUserUseCase } from "./application/use-cases/update-user";
import { UserRepository } from "./infrastructure/repository/user.repository";
import { UserController } from "./presentation/user.controller";
import { createUsersRouter } from "./presentation/user.routes";

// infrastructures
const userRepository = new UserRepository()

// use cases
const getUsersUseCase = new GetUsersUseCase(userRepository)
const getUserUseCase = new GetUserUseCase(userRepository)
const updateUserUseCase = new UpdateUserUseCase(userRepository)

// presentation
const userController = new UserController(
  getUsersUseCase,
  getUserUseCase,
  updateUserUseCase
)
const router = createUsersRouter(userController)

export default router