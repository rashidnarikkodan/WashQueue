import { StationMongoRepository } from "./infrastructure/repositories/station.mongo.repository"
import { StationPricingMongoRepository } from "./infrastructure/repositories/station-pricing.mongo.repository"
import { ExtraServiceMongoRepository } from "./infrastructure/repositories/extra-service.mongo.repository"
import { CreateStationUseCase } from "./application/use-cases/create-station.usecase"
import { UpdateStationUseCase } from "./application/use-cases/update-station.usecase"
import { GetStationUseCase } from "./application/use-cases/get-station.usecase"
import { SubmitStationUseCase } from "./application/use-cases/submit-station.usecase"
import { StationController } from "./presentation/station.controller"
import { createRouter } from "./presentation/station.routes"

// Instantiate repositories
export const stationRepository = new StationMongoRepository()
export const stationPricingRepository = new StationPricingMongoRepository()
export const extraServiceRepository = new ExtraServiceMongoRepository()

// Instantiate use cases
const createStationUseCase = new CreateStationUseCase(stationRepository)
const updateStationUseCase = new UpdateStationUseCase(
  stationRepository,
  stationPricingRepository,
  extraServiceRepository
)
const getStationUseCase = new GetStationUseCase(
  stationRepository,
  stationPricingRepository,
  extraServiceRepository
)
const submitStationUseCase = new SubmitStationUseCase(
  stationRepository,
  stationPricingRepository
)

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
