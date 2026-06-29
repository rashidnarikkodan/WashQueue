import { GetUsers } from "./application/use-cases/get-users";
import { MongooseUserRepository } from "./infrastructure/repositories/mongoose-user.repository";
import { UserController } from "./presentation/user.controller";
import { createUsersRouter } from "./presentation/user.routes";


// infrastructers
const userRepository = new MongooseUserRepository()

// applications
const getUsersUseCase = new GetUsers(userRepository)

//presentation
const userController = new UserController(getUsersUseCase)
const router = createUsersRouter(userController)

export default router