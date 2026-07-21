import { StationMongoRepository } from "./infrastructure/repositories/station.mongo.repository"
import { StationPricingMongoRepository } from "./infrastructure/repositories/station-pricing.mongo.repository"
import { ExtraServiceMongoRepository } from "./infrastructure/repositories/extra-service.mongo.repository"
import { CreateStationUseCase } from "./application/use-cases/create-station.usecase"
import { UpdateStationUseCase } from "./application/use-cases/update-station.usecase"
import { GetStationUseCase } from "./application/use-cases/get-station.usecase"
import { SubmitStationUseCase } from "./application/use-cases/submit-station.usecase"
import { StationController } from "./presentation/station.controller"
import { createRouter } from "./presentation/station.routes"
import { GetStationsUseCase } from "./application/use-cases/get-stations.usecase"
import { OwnerMongoRepository } from "../owner/infrastructure/repository/owner.mongo.repository"
import { StationRequestMapper } from "./presentation/mappers/station.mapper"

// Instantiate repositories
export const stationRepository = new StationMongoRepository()
export const ownerRepository = new OwnerMongoRepository()
export const stationPricingRepository = new StationPricingMongoRepository()
export const extraServiceRepository = new ExtraServiceMongoRepository()

// Instantiate request mappers
const stationRequestMapper = new StationRequestMapper()

// Instantiate use cases
const createStationUseCase = new CreateStationUseCase(stationRepository, ownerRepository)
const updateStationUseCase = new UpdateStationUseCase(
  stationRepository,
  ownerRepository,
  stationPricingRepository,
  extraServiceRepository
)
const getStationUseCase = new GetStationUseCase(
  stationRepository,
  stationPricingRepository,
  extraServiceRepository,
  ownerRepository
)
const getStationsUseCase = new GetStationsUseCase(stationRepository)
const submitStationUseCase = new SubmitStationUseCase(
  stationRepository,
  ownerRepository,
  stationPricingRepository
)

// Instantiate controller
const stationController = new StationController(
  createStationUseCase,
  updateStationUseCase,
  getStationUseCase,
  getStationsUseCase,
  submitStationUseCase,
  stationRequestMapper
)

// Create router
const stationRouter = createRouter(stationController)

export default stationRouter
