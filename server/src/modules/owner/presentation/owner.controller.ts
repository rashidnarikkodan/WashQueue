import { Response } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { SUCCESS_MESSAGES } from "@/common/constants/app.constants"
import success from "@/common/utils/success"
import { setAuthCookies } from "@/common/utils/cookies"
import { NotFoundError } from "@/common/errors/not-found-error"
import { AppError } from "@/common/errors/app-error"
import {
  ISaveOnboardingStepUseCase,
  IGetOnboardingStatusUseCase,
  ISubmitOnboardingUseCase,
  ICreateOwnerUseCase,
  IGetOwnerUseCase,
  IUpdateOwnerUseCase,
} from "../application/interfaces/owner-usecases.interfaces"
import { createOwnerSchema, updateOwnerSchema } from "./schema/owner.schema"
import { IMediaStorage } from "@/core/application/interfaces/media.interface"

export class OwnerController {
  constructor(
    private readonly saveOnboardingStepUseCase: ISaveOnboardingStepUseCase,
    private readonly getOnboardingStatusUseCase: IGetOnboardingStatusUseCase,
    private readonly submitOnboardingUseCase: ISubmitOnboardingUseCase,
    private readonly createOwnerUseCase: ICreateOwnerUseCase,
    private readonly getOwnerUseCase: IGetOwnerUseCase,
    private readonly updateOwnerUseCase: IUpdateOwnerUseCase,
    private readonly mediaStorage: IMediaStorage
  ) { }

  /** GET /api/owner/onboarding/status */
  getOnboardingStatus = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        data: null,
      })
      return
    }
    const result = await this.getOnboardingStatusUseCase.execute(userId)
    success(res, result, HTTP_STATUS.OK, "Onboarding status retrieved successfully")
  }

  /** POST /api/owner/onboarding/step */
  saveOnboardingStep = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        data: null,
      })
      return
    }

    const step = parseInt(req.body.step ?? "1", 10)

    // Extract text fields from body
    const {
      fullName,
      phone,
      whatsapp,
      businessName,
      gstNumber,
      idProofType,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
    } = req.body

    // Extract file URLs from uploaded files
    const files = req.files as Record<string, Express.Multer.File[]> | undefined
    const uploadFile = async (fieldname: string): Promise<string | undefined> => {
      const file = files?.[fieldname]?.[0]
      if (!file) return undefined
      const uploaded = await this.mediaStorage.upload(file.buffer, file.originalname)
      return uploaded.url
    }

    const details: Record<string, string | undefined> = {
      fullName,
      phone,
      whatsapp,
      businessName,
      gstNumber,
      idProofType,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
    }

    // Only set file URLs if files were uploaded (avoid wiping existing values)
    const idProofUrl = await uploadFile("idProofFile")
    const businessLicenseUrl = await uploadFile("businessLicenseFile")
    const gstCertificateUrl = await uploadFile("gstCertificateFile")
    const bankProofUrl = await uploadFile("bankProofFile")

    if (idProofUrl) details.idProofUrl = idProofUrl
    if (businessLicenseUrl) details.businessLicenseUrl = businessLicenseUrl
    if (gstCertificateUrl) details.gstCertificateUrl = gstCertificateUrl
    if (bankProofUrl) details.bankProofUrl = bankProofUrl

    // Remove undefined keys
    const cleanDetails = Object.fromEntries(
      Object.entries(details).filter(([, v]) => v !== undefined && v !== "")
    )

    const result = await this.saveOnboardingStepUseCase.execute(userId, step, cleanDetails)
    if (result.tokens) {
      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken)
    }
    const { tokens, ...rest } = result
    success(res, rest, HTTP_STATUS.OK, "Onboarding step saved successfully")
  }

  /** POST /api/owner/onboarding/submit */
  submitOnboarding = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        data: null,
      })
      return
    }

    const result = await this.submitOnboardingUseCase.execute(userId)
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken)

    // omit tokens from response body for security/cleanliness
    const { tokens, ...rest } = result
    success(res, rest, HTTP_STATUS.OK, result.message)
  }

  createOwner = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new AppError(ERROR_MESSAGES.USER_ID_REQUIRED, HTTP_STATUS.BAD_REQUEST)
    }

    const validatedBody = createOwnerSchema.parse(req.body)
    const data = await this.createOwnerUseCase.execute({
      ...validatedBody,
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

    const validatedBody = updateOwnerSchema.parse(req.body)
    const data = await this.updateOwnerUseCase.execute(userId, validatedBody)

    if (!data) {
      throw new NotFoundError(ERROR_MESSAGES.OWNER_NOT_FOUND)
    }

    success(res, data, HTTP_STATUS.OK, SUCCESS_MESSAGES.OWNER_UPDATED_SUCCESS)
  }
}
