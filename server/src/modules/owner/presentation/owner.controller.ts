import { Response } from "express"
import { z } from "zod"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { SUCCESS_MESSAGES } from "@/common/constants/app.constants"
import success from "@/common/utils/success"
import { setAuthCookies } from "@/common/utils/cookies"
import { NotFoundError } from "@/common/errors/not-found-error"
import { AppError } from "@/common/errors/app-error"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import {
  ISaveOnboardingStepUseCase,
  IGetOnboardingStatusUseCase,
  ISubmitOnboardingUseCase,
  ICreateOwnerUseCase,
  IGetOwnerUseCase,
  IUpdateOwnerUseCase,
} from "../application/interfaces/owner-usecases.interfaces"
import { createOwnerSchema, updateOwnerSchema } from "./schema/owner.schema"
import { OnboardingStepRequestMapper } from "../application/mappers/onboarding-step.mapper"

export class OwnerController {
  constructor(
    private readonly saveOnboardingStepUseCase: ISaveOnboardingStepUseCase,
    private readonly getOnboardingStatusUseCase: IGetOnboardingStatusUseCase,
    private readonly submitOnboardingUseCase: ISubmitOnboardingUseCase,
    private readonly createOwnerUseCase: ICreateOwnerUseCase,
    private readonly getOwnerUseCase: IGetOwnerUseCase,
    private readonly updateOwnerUseCase: IUpdateOwnerUseCase,
    private readonly onboardingStepMapper: OnboardingStepRequestMapper
  ) {}

  getOnboardingStatus = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const result = await this.getOnboardingStatusUseCase.execute(userId)
    success(res, result, HTTP_STATUS.OK, "Onboarding status retrieved successfully")
  }

  saveOnboardingStep = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const { step, details } = await this.onboardingStepMapper.mapToOnboardingDetails(req)
    const result = await this.saveOnboardingStepUseCase.execute(userId, step, details)

    if (result.tokens) {
      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken)
    }

    const rest = { ...result }
    delete (rest as Record<string, unknown>).tokens

    success(res, rest, HTTP_STATUS.OK, "Onboarding step saved successfully")
  }

  submitOnboarding = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED)
    }

    const result = await this.submitOnboardingUseCase.execute(userId)
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken)

    const rest = { ...result }
    delete (rest as Record<string, unknown>).tokens

    success(res, rest, HTTP_STATUS.OK, result.message)
  }

  createOwner = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new AppError(ERROR_MESSAGES.USER_ID_REQUIRED, HTTP_STATUS.BAD_REQUEST)
    }

    const data = await this.createOwnerUseCase.execute({
      ...(req.body as z.infer<typeof createOwnerSchema>),
      userId,
    })

    success(res, data, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.OWNER_CREATED_SUCCESS)
  }

  getOwnerProfile = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new AppError(ERROR_MESSAGES.USER_ID_REQUIRED, HTTP_STATUS.BAD_REQUEST)
    }

    const data = await this.getOwnerUseCase.execute(userId)
    if (!data) {
      throw new NotFoundError(ERROR_MESSAGES.OWNER_NOT_FOUND)
    }

    success(res, data, HTTP_STATUS.OK, SUCCESS_MESSAGES.OWNER_RETRIEVED_SUCCESS)
  }

  updateOwnerProfile = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new AppError(ERROR_MESSAGES.USER_ID_REQUIRED, HTTP_STATUS.BAD_REQUEST)
    }

    const data = await this.updateOwnerUseCase.execute(userId, req.body as z.infer<typeof updateOwnerSchema>)

    if (!data) {
      throw new NotFoundError(ERROR_MESSAGES.OWNER_NOT_FOUND)
    }

    success(res, data, HTTP_STATUS.OK, SUCCESS_MESSAGES.OWNER_UPDATED_SUCCESS)
  }
}
