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
import { ReviewStationUseCase } from "./application/use-cases/review-station.usecase"
import { CloudinaryService } from "@/infrastructure/storage/cloudinary.service"
import { MediaUploadService } from "@/core/application/services/media-upload.service"
import { StationStepParserFactory } from "./presentation/parsers/station-step.parser"

// Instantiate repositories & services
export const stationRepository = new StationMongoRepository()
export const ownerRepository = new OwnerMongoRepository()
export const stationPricingRepository = new StationPricingMongoRepository()
export const extraServiceRepository = new ExtraServiceMongoRepository()
const cloudinaryService = new CloudinaryService()
const mediaUploadService = new MediaUploadService(cloudinaryService)

// Instantiate step parser factory & request mapper
const stationStepParserFactory = new StationStepParserFactory()
const stationRequestMapper = new StationRequestMapper(stationStepParserFactory)

import { DeleteStationUseCase } from "./application/use-cases/delete-station.usecase"
import { ToggleActiveStationUseCase } from "./application/use-cases/toggle-active-station.usecase"

// Instantiate use cases
const createStationUseCase = new CreateStationUseCase(
  stationRepository,
  ownerRepository,
  mediaUploadService
)
const updateStationUseCase = new UpdateStationUseCase(
  stationRepository,
  ownerRepository,
  stationPricingRepository,
  extraServiceRepository,
  cloudinaryService,
  mediaUploadService
)
const getStationUseCase = new GetStationUseCase(
  stationRepository,
  stationPricingRepository,
  extraServiceRepository
)
const getStationsUseCase = new GetStationsUseCase(stationRepository)
const submitStationUseCase = new SubmitStationUseCase(
  stationRepository,
  ownerRepository,
  stationPricingRepository
)
const reviewStationUseCase = new ReviewStationUseCase(stationRepository)
const deleteStationUseCase = new DeleteStationUseCase(
  stationRepository,
  stationPricingRepository,
  extraServiceRepository
)
const toggleActiveStationUseCase = new ToggleActiveStationUseCase(
  stationRepository,
  ownerRepository
)

// Instantiate controller
const stationController = new StationController(
  createStationUseCase,
  updateStationUseCase,
  getStationUseCase,
  getStationsUseCase,
  submitStationUseCase,
  reviewStationUseCase,
  deleteStationUseCase,
  toggleActiveStationUseCase,
  ownerRepository,
  stationRequestMapper
)

// Create router
const stationRouter = createRouter(stationController)

export default stationRouter
