import { tokenService } from "../auth/auth.module"
import { SaveOnboardingStepUseCase } from "./application/use-cases/save-onboarding-step.use-case"
import { GetOnboardingStatusUseCase } from "./application/use-cases/get-onboarding-status.use-case"
import { SubmitOnboardingUseCase } from "./application/use-cases/submit-onboarding.use-case"
import { OwnerController } from "./presentation/owner.controller"
import { createOwnerRouter } from "./presentation/owner.routes"
import { MongooseOwnerRepository } from "./infrastructure/repositories/mongoose-owner.repository"

const ownerRepository = new MongooseOwnerRepository()

const saveOnboardingStepUseCase = new SaveOnboardingStepUseCase(ownerRepository, tokenService)
const getOnboardingStatusUseCase = new GetOnboardingStatusUseCase(ownerRepository)
const submitOnboardingUseCase = new SubmitOnboardingUseCase(ownerRepository, tokenService)

const ownerController = new OwnerController(
  saveOnboardingStepUseCase,
  getOnboardingStatusUseCase,
  submitOnboardingUseCase
)

const ownerRouter = createOwnerRouter(ownerController)

export { ownerRouter }
export default ownerRouter
