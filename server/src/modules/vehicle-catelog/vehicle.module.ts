import { VehicleCategoryMongoRepository } from "./infrastructure/repositories/vehicle-category.mongo.repository"
import { VehicleClassMongoRepository } from "./infrastructure/repositories/vehicle-class.mongo.repository"
import { CreateCategoryUseCase } from "./application/use-cases/create-category.use-case"
import { GetCategoryUseCase } from "./application/use-cases/get-category.use-case"
import { GetCategoriesUseCase } from "./application/use-cases/get-categories.use-case"
import { UpdateCategoryUseCase } from "./application/use-cases/update-category.use-case"
import { DeleteCategoryUseCase } from "./application/use-cases/delete-category.use-case"
import { CreateClassUseCase } from "./application/use-cases/create-class.use-case"
import { GetClassUseCase } from "./application/use-cases/get-class.use-case"
import { GetClassesUseCase } from "./application/use-cases/get-classes.use-case"
import { UpdateClassUseCase } from "./application/use-cases/update-class.use-case"
import { DeleteClassUseCase } from "./application/use-cases/delete-class.use-case"
import { VehicleCatelogController } from "./presentation/vehicle-catelog.controller"
import { createVehicleCatelogRouter } from "./presentation/vehicle-catelog.router"

// Repositories
export const vehicleCategoryRepository = new VehicleCategoryMongoRepository()
export const vehicleClassRepository = new VehicleClassMongoRepository()

// Use Cases
const createCategoryUseCase = new CreateCategoryUseCase(vehicleCategoryRepository)
const getCategoryUseCase = new GetCategoryUseCase(vehicleCategoryRepository)
const getCategoriesUseCase = new GetCategoriesUseCase(vehicleCategoryRepository)
const updateCategoryUseCase = new UpdateCategoryUseCase(vehicleCategoryRepository)
const deleteCategoryUseCase = new DeleteCategoryUseCase(vehicleCategoryRepository, vehicleClassRepository)

const createClassUseCase = new CreateClassUseCase(vehicleClassRepository, vehicleCategoryRepository)
const getClassUseCase = new GetClassUseCase(vehicleClassRepository)
const getClassesUseCase = new GetClassesUseCase(vehicleClassRepository)
const updateClassUseCase = new UpdateClassUseCase(vehicleClassRepository, vehicleCategoryRepository)
const deleteClassUseCase = new DeleteClassUseCase(vehicleClassRepository)

// Controller
const vehicleCatelogController = new VehicleCatelogController(
  createCategoryUseCase,
  getCategoryUseCase,
  getCategoriesUseCase,
  updateCategoryUseCase,
  deleteCategoryUseCase,
  createClassUseCase,
  getClassUseCase,
  getClassesUseCase,
  updateClassUseCase,
  deleteClassUseCase
)

// Router
const vehicleCatelogRouter = createVehicleCatelogRouter(vehicleCatelogController)

export default vehicleCatelogRouter
