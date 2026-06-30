import { GetUsers } from "./application/use-cases/get-users";
import { GetUser } from "./application/use-cases/get-user";
import { UpdateUser } from "./application/use-cases/update-user";
import { MongooseUserRepository } from "./infrastructure/repositories/mongoose-user.repository";
import { UserController } from "./presentation/user.controller";
import { createUsersRouter } from "./presentation/user.routes";

// infrastructures
const userRepository = new MongooseUserRepository()

// use cases
const getUsersUseCase = new GetUsers(userRepository)
const getUserUseCase = new GetUser(userRepository)
const updateUserUseCase = new UpdateUser(userRepository)

// presentation
const userController = new UserController(
  getUsersUseCase,
  getUserUseCase,
  updateUserUseCase
)
const router = createUsersRouter(userController)

export default router