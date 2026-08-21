import { VehicleMongoRepository } from "./infrastructure/repositories/vehicle.mongo.repository"
import { CreateVehicleUseCase } from "./application/use-cases/create-vehicle.use-case"
import { UpdateVehicleUseCase } from "./application/use-cases/update-vehicle.use-case"
import { DeleteVehicleUseCase } from "./application/use-cases/delete-vehicle.use-case"
import { GetVehicleUseCase } from "./application/use-cases/get-vehicle.use-case"
import { GetVehiclesUseCase } from "./application/use-cases/get-vehicles.use-case"
import { SetPrimaryVehicleUseCase } from "./application/use-cases/set-primary-vehicle.use-case"
import { VehicleController } from "./presentation/vehicle.controller"
import { createVehicleRouter } from "./presentation/vehicle.routes"
import { CloudinaryService } from "@/infrastructure/storage/cloudinary.service"

export const vehicleRepository = new VehicleMongoRepository()
const cloudinaryService = new CloudinaryService()

const createVehicleUseCase = new CreateVehicleUseCase(vehicleRepository)
const updateVehicleUseCase = new UpdateVehicleUseCase(vehicleRepository)
const deleteVehicleUseCase = new DeleteVehicleUseCase(vehicleRepository)
const getVehicleUseCase = new GetVehicleUseCase(vehicleRepository)
const getVehiclesUseCase = new GetVehiclesUseCase(vehicleRepository)
const setPrimaryVehicleUseCase = new SetPrimaryVehicleUseCase(vehicleRepository)

const vehicleController = new VehicleController(
  createVehicleUseCase,
  updateVehicleUseCase,
  deleteVehicleUseCase,
  getVehicleUseCase,
  getVehiclesUseCase,
  setPrimaryVehicleUseCase,
  cloudinaryService
)

const vehicleRouter = createVehicleRouter(vehicleController)

export default vehicleRouter
