import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { IOwnerOnboardingDetails } from "../../application/interfaces/owner-usecases.interfaces"
import { MediaUploadService, MulterFileMap } from "@/core/application/services/media-upload.service"

export interface ParsedOnboardingStepRequest {
  step: number
  details: IOwnerOnboardingDetails
}

export class OnboardingStepRequestMapper {
  constructor(private readonly mediaUploadService: MediaUploadService) {}

  /**
   * Extracts text fields and uploaded files from the multipart HTTP request,
   * returning clean onboarding details DTO.
   */
  async mapToOnboardingDetails(req: AuthenticatedRequest): Promise<ParsedOnboardingStepRequest> {
    const step = parseInt(req.body.step ?? "1", 10)

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

    const files = req.files as MulterFileMap | undefined

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

    // Process file uploads via MediaUploadService safely
    const [idProofUrl, businessLicenseUrl, gstCertificateUrl, bankProofUrl] = await Promise.all([
      this.mediaUploadService.uploadFileByFieldname(files, "idProofFile"),
      this.mediaUploadService.uploadFileByFieldname(files, "businessLicenseFile"),
      this.mediaUploadService.uploadFileByFieldname(files, "gstCertificateFile"),
      this.mediaUploadService.uploadFileByFieldname(files, "bankProofFile"),
    ])

    if (idProofUrl) details.idProofUrl = idProofUrl
    if (businessLicenseUrl) details.businessLicenseUrl = businessLicenseUrl
    if (gstCertificateUrl) details.gstCertificateUrl = gstCertificateUrl
    if (bankProofUrl) details.bankProofUrl = bankProofUrl

    // Filter out undefined or empty string values
    const cleanDetails = Object.fromEntries(
      Object.entries(details).filter(([, v]) => v !== undefined && v !== "")
    ) as IOwnerOnboardingDetails

    return {
      step,
      details: cleanDetails,
    }
  }
}
