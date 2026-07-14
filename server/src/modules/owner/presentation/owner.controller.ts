import { Response } from "express"
import { AuthenticatedRequest } from "@/shared/middleware/authenticate"
import { HTTP_STATUS } from "@/shared/constants/http.constants"
import { ERROR_MESSAGES } from "@/shared/constants/error.constants"
import success from "@/shared/utils/success"
import { setAuthCookies } from "@/shared/utils/cookies"
import {
  ISaveOnboardingStepUseCase,
  IGetOnboardingStatusUseCase,
  ISubmitOnboardingUseCase,
} from "../application/interfaces/owner-usecases.interfaces"

export class OwnerController {
  constructor(
    private readonly saveOnboardingStepUseCase: ISaveOnboardingStepUseCase,
    private readonly getOnboardingStatusUseCase: IGetOnboardingStatusUseCase,
    private readonly submitOnboardingUseCase: ISubmitOnboardingUseCase
  ) {}

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
      businessType,
      gstNumber,
      idProofType,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      accountType,
    } = req.body

    // Extract file URLs from uploaded files
    const files = req.files as Record<string, Express.Multer.File[]> | undefined
    const getFileUrl = (fieldname: string): string | undefined => {
      const file = files?.[fieldname]?.[0]
      return file ? `/uploads/onboarding/${file.filename}` : undefined
    }

    const details: Record<string, string | undefined> = {
      fullName,
      phone,
      whatsapp,
      businessName,
      businessType,
      gstNumber,
      idProofType,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      accountType,
    }

    // Only set file URLs if files were uploaded (avoid wiping existing values)
    const idProofUrl = getFileUrl("idProofFile")
    const businessLicenseUrl = getFileUrl("businessLicenseFile")
    const gstCertificateUrl = getFileUrl("gstCertificateFile")
    const bankProofUrl = getFileUrl("bankProofFile")

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
}
