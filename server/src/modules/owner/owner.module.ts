import { OwnerMongoRepository } from "./infrastructure/repository/owner.mongo.repository"
import { userRepository } from "../user/user.module"
import { CreateOwnerUseCase } from "./application/use-cases/create-owner.use-case"
import { GetOwnerUseCase } from "./application/use-cases/get-owner.use-case"
import { UpdateOwnerUseCase } from "./application/use-cases/update-owner.use-case"
import { OwnerController } from "./presentation/owner.controller"
import { createOwnerRouter } from "./presentation/owner.routes"

// infrastructures/repositories
export const ownerRepository = new OwnerMongoRepository()

// use cases
const createOwnerUseCase = new CreateOwnerUseCase(ownerRepository, userRepository)
const getOwnerUseCase = new GetOwnerUseCase(ownerRepository)
const updateOwnerUseCase = new UpdateOwnerUseCase(ownerRepository)

// presentation
const ownerController = new OwnerController(
  createOwnerUseCase,
  getOwnerUseCase,
  updateOwnerUseCase
)

const ownerRouter = createOwnerRouter(ownerController)

export default ownerRouter
