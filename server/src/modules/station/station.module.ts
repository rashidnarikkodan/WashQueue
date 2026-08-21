import { MongooseTransactionRunner } from "@/infrastructure/database/mongoose-transaction.runner"
import { StationMongoRepository } from "./infrastructure/repositories/station.mongo.repository"
import { StationPricingMongoRepository } from "./infrastructure/repositories/station-pricing.mongo.repository"
import { ExtraServiceMongoRepository } from "./infrastructure/repositories/extra-service.mongo.repository"
import { SlotConfigMongoRepository } from "./infrastructure/repositories/slot-config.mongo.repository"
import { TimeWindowMongoRepository } from "./infrastructure/repositories/time-window.mongo.repository"
import { TimeWindowGenerationService } from "./domain/services/TimeWindowGenerationService"
import { EnsureBookingHorizonService } from "./application/services/ensure-booking-horizon.service"
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
import { ConfigureSlotConfigUseCase } from "./application/use-cases/configure-slot-config.usecase"
import { GetSlotConfigUseCase } from "./application/use-cases/get-slot-config.usecase"
import { GenerateTimeWindowsUseCase } from "./application/use-cases/generate-time-windows.usecase"
import { GetBookingCalendarUseCase } from "./application/use-cases/get-booking-calendar.usecase"
import { GetAvailableTimeWindowsUseCase } from "./application/use-cases/get-available-time-windows.usecase"
import { MongoManagerAssignmentRepository } from "../manager/infrastructure/repositories/manager-assignment.mongo.repository"
import { DeleteStationUseCase } from "./application/use-cases/delete-station.usecase"
import { ToggleActiveStationUseCase } from "./application/use-cases/toggle-active-station.usecase"
import { AssignManagerUseCase } from "./application/use-cases/assign-manager.usecase"
import { GetStationFilterOptionsUseCase } from "./application/use-cases/get-station-filter-options.usecase"
import { VehicleCategoryMongoRepository } from "../vehicle-catelog/infrastructure/repositories/vehicle-category.mongo.repository"
import { VehicleClassMongoRepository } from "../vehicle-catelog/infrastructure/repositories/vehicle-class.mongo.repository"
import { RedisCacheService } from "@/infrastructure/cache/redis-cache.service"

import { UserRepository } from "../user/infrastructure/repository/user.mongo.repository"

export const stationRepository = new StationMongoRepository()
export const ownerRepository = new OwnerMongoRepository()
export const userRepository = new UserRepository()
export const stationPricingRepository = new StationPricingMongoRepository()
export const extraServiceRepository = new ExtraServiceMongoRepository()
export const slotConfigRepository = new SlotConfigMongoRepository()
export const timeWindowRepository = new TimeWindowMongoRepository()

const timeWindowGenerationService = new TimeWindowGenerationService()
const cloudinaryService = new CloudinaryService()
const mediaUploadService = new MediaUploadService(cloudinaryService)

const stationStepParserFactory = new StationStepParserFactory()
const stationRequestMapper = new StationRequestMapper(stationStepParserFactory)
const managerAssignmentRepository = new MongoManagerAssignmentRepository()

const ensureBookingHorizonService = new EnsureBookingHorizonService(
  stationRepository,
  slotConfigRepository,
  timeWindowRepository,
  timeWindowGenerationService
)

const generateTimeWindowsUseCase = new GenerateTimeWindowsUseCase(
  stationRepository,
  slotConfigRepository,
  timeWindowRepository,
  timeWindowGenerationService
)

const configureSlotConfigUseCase = new ConfigureSlotConfigUseCase(
  stationRepository,
  slotConfigRepository,
  generateTimeWindowsUseCase
)

const getSlotConfigUseCase = new GetSlotConfigUseCase(stationRepository, slotConfigRepository)

const getBookingCalendarUseCase = new GetBookingCalendarUseCase(
  stationRepository,
  slotConfigRepository,
  timeWindowRepository,
  ensureBookingHorizonService
)

const getAvailableTimeWindowsUseCase = new GetAvailableTimeWindowsUseCase(
  stationRepository,
  timeWindowRepository,
  ensureBookingHorizonService
)

const createStationUseCase = new CreateStationUseCase(
  stationRepository,
  ownerRepository,
  mediaUploadService
)
const transactionRunner = new MongooseTransactionRunner()

const updateStationUseCase = new UpdateStationUseCase(
  stationRepository,
  ownerRepository,
  stationPricingRepository,
  extraServiceRepository,
  cloudinaryService,
  mediaUploadService,
  managerAssignmentRepository,
  slotConfigRepository,
  generateTimeWindowsUseCase,
  transactionRunner
)
const getStationUseCase = new GetStationUseCase(
  stationRepository,
  stationPricingRepository,
  extraServiceRepository
)
const getStationsUseCase = new GetStationsUseCase(stationRepository, userRepository)
const submitStationUseCase = new SubmitStationUseCase(
  stationRepository,
  ownerRepository,
  stationPricingRepository
)
const reviewStationUseCase = new ReviewStationUseCase(stationRepository)
const deleteStationUseCase = new DeleteStationUseCase(
  stationRepository,
  stationPricingRepository,
  extraServiceRepository,
  transactionRunner
)
const toggleActiveStationUseCase = new ToggleActiveStationUseCase(
  stationRepository,
  ownerRepository
)
const assignManagerUseCase = new AssignManagerUseCase(stationRepository, ownerRepository)

const vehicleCategoryRepository = new VehicleCategoryMongoRepository()
const vehicleClassRepository = new VehicleClassMongoRepository()
const filterOptionsCacheService = new RedisCacheService()
const getStationFilterOptionsUseCase = new GetStationFilterOptionsUseCase(
  vehicleCategoryRepository,
  vehicleClassRepository,
  stationPricingRepository,
  filterOptionsCacheService
)

const stationController = new StationController(
  createStationUseCase,
  updateStationUseCase,
  getStationUseCase,
  getStationsUseCase,
  submitStationUseCase,
  reviewStationUseCase,
  deleteStationUseCase,
  toggleActiveStationUseCase,
  assignManagerUseCase,
  ownerRepository,
  stationRequestMapper,
  configureSlotConfigUseCase,
  getSlotConfigUseCase,
  getBookingCalendarUseCase,
  getAvailableTimeWindowsUseCase,
  getStationFilterOptionsUseCase
)

const stationRouter = createRouter(stationController)

export default stationRouter
