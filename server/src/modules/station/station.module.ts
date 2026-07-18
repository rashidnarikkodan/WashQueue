import { StationMongoRepository } from "./infrastructure/repositories/station.mongo.repository"
import { CreateStationUseCase } from "./application/use-cases/create-station.usecase"
import { UpdateStationUseCase } from "./application/use-cases/update-station.usecase"
import { GetStationUseCase } from "./application/use-cases/get-station.usecase"
import { SubmitStationUseCase } from "./application/use-cases/submit-station.usecase"
import { StationController } from "./presentation/station.controller"
import { createRouter } from "./presentation/station.routes"

// Instantiate repository
export const stationRepository = new StationMongoRepository()

// Instantiate use cases
const createStationUseCase = new CreateStationUseCase(stationRepository)
const updateStationUseCase = new UpdateStationUseCase(stationRepository)
const getStationUseCase = new GetStationUseCase(stationRepository)
const submitStationUseCase = new SubmitStationUseCase(stationRepository)

// Instantiate controller
const stationController = new StationController(
  createStationUseCase,
  updateStationUseCase,
  getStationUseCase,
  submitStationUseCase
)

// Create router
const stationRouter = createRouter(stationController)

export default stationRouter
