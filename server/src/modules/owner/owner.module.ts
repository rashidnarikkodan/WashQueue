import { OwnerMongoRepository } from "./infrastructure/repository/owner.mongo.repository"
import { userRepository } from "../user/user.module"
import { tokenService } from "../auth/auth.module"
import { CreateOwnerUseCase } from "./application/use-cases/create-owner.use-case"
import { GetOwnerUseCase } from "./application/use-cases/get-owner.use-case"
import { UpdateOwnerUseCase } from "./application/use-cases/update-owner.use-case"
import { SaveOnboardingStepUseCase } from "./application/use-cases/save-onboarding-step.use-case"
import { GetOnboardingStatusUseCase } from "./application/use-cases/get-onboarding-status.use-case"
import { SubmitOnboardingUseCase } from "./application/use-cases/submit-onboarding.use-case"
import { ApproveOwnerUseCase } from "./application/use-cases/approve-owner.use-case"
import { OwnerController } from "./presentation/owner.controller"
import { createOwnerRouter } from "./presentation/owner.routes"
import { CloudinaryService } from "@/infrastructure/storage/cloudinary.service"
import { MediaUploadService } from "@/core/application/services/media-upload.service"
import { MailService } from "@/core/application/services/mail.service"
import { razorpayXPayoutProvider } from "@/infrastructure/payment/razorpayx-payout.service"
import { OnboardingStepRequestMapper } from "./application/mappers/onboarding-step.mapper"

export const ownerRepository = new OwnerMongoRepository()
const cloudinaryService = new CloudinaryService()
const mediaUploadService = new MediaUploadService(cloudinaryService)
const mailService = new MailService()

const onboardingStepMapper = new OnboardingStepRequestMapper(mediaUploadService)

const createOwnerUseCase = new CreateOwnerUseCase(ownerRepository, userRepository)
const getOwnerUseCase = new GetOwnerUseCase(ownerRepository)
const updateOwnerUseCase = new UpdateOwnerUseCase(ownerRepository)
const saveOnboardingStepUseCase = new SaveOnboardingStepUseCase(ownerRepository, userRepository)
const getOnboardingStatusUseCase = new GetOnboardingStatusUseCase(ownerRepository)
const submitOnboardingUseCase = new SubmitOnboardingUseCase(
  ownerRepository,
  tokenService,
  userRepository
)
const approveOwnerUseCase = new ApproveOwnerUseCase(
  ownerRepository,
  userRepository,
  mailService,
  razorpayXPayoutProvider
)

const ownerController = new OwnerController(
  saveOnboardingStepUseCase,
  getOnboardingStatusUseCase,
  submitOnboardingUseCase,
  createOwnerUseCase,
  getOwnerUseCase,
  updateOwnerUseCase,
  approveOwnerUseCase,
  onboardingStepMapper
)

const ownerRouter = createOwnerRouter(ownerController)

export default ownerRouter
