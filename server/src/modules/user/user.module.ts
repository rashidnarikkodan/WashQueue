import { GetUsers } from "./application/use-cases/get-users";
import { GetUser } from "./application/use-cases/get-user";
import { UpdateUser } from "./application/use-cases/update-user";
import { MongooseUserRepository } from "./infrastructure/repositories/mongoose-user.repository";
import { UserController } from "./presentation/user.controller";
import { createUsersRouter } from "./presentation/user.routes";
import { MongooseOwnerRepository } from "../owner/infrastructure/repositories/mongoose-owner.repository";

// infrastructures
const userRepository = new MongooseUserRepository()
const ownerRepository = new MongooseOwnerRepository()

// use cases
const getUsersUseCase = new GetUsers(userRepository, ownerRepository)
const getUserUseCase = new GetUser(userRepository, ownerRepository)
const updateUserUseCase = new UpdateUser(userRepository, ownerRepository)

// presentation
const userController = new UserController(
  getUsersUseCase,
  getUserUseCase,
  updateUserUseCase
)
const router = createUsersRouter(userController)

export default router