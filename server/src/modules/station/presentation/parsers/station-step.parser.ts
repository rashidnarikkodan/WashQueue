import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import {
  UpdateStationInput,
  UpdateBasicInfoInput,
  UpdateAvailabilityInput,
  UpsertPricingInput,
  UpdateAmenitiesInput,
} from "../../application/dtos/update-station.dto"
import { MediaUploadService } from "@/core/application/services/media-upload.service"
import { StationImage } from "../../domain/entities/Station"

export interface IStationStepParser<T> {
  supports(step: number): boolean
  parse(req: AuthenticatedRequest): Promise<T>
}

/** Utility function to parse JSON string fields safely */
export function safeJsonParse<T>(val: unknown, fallback: T): T {
  if (val === undefined || val === null || val === "") {
    return fallback
  }
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as T
    } catch {
      throw new AppError("Invalid JSON payload for field", HTTP_STATUS.BAD_REQUEST)
    }
  }
  return val as T
}

export class StationStep1Parser implements IStationStepParser<{ step: 1 } & UpdateBasicInfoInput> {
  constructor(private readonly mediaUploadService: MediaUploadService) {}

  supports(step: number): boolean {
    return step === 1
  }

  async parse(req: AuthenticatedRequest): Promise<{ step: 1 } & UpdateBasicInfoInput> {
    const { name, description, status } = req.body

    const contact = safeJsonParse(req.body.contact, undefined)
    const location = safeJsonParse(req.body.location, undefined)
    const address = safeJsonParse(req.body.address, undefined)
    const deletedImagePublicIds = safeJsonParse(req.body.deletedImagePublicIds, undefined)

    let images: StationImage[] = safeJsonParse(req.body.images, [])

    // Process uploaded files if available
    const files = req.files
    let multerFiles: Express.Multer.File[] = []
    if (Array.isArray(files)) {
      multerFiles = files
    } else if (files && typeof files === "object") {
      multerFiles = Object.values(files).flat()
    }

    if (multerFiles.length > 0) {
      const uploadedImages = await this.mediaUploadService.uploadMultipleFiles(multerFiles)
      const newStationImages: StationImage[] = uploadedImages.map((img, index) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: images.length === 0 && index === 0,
      }))
      images = [...images, ...newStationImages]
    }

    return {
      step: 1,
      name,
      description,
      contact,
      location,
      address,
      images: images.length > 0 ? images : undefined,
      deletedImagePublicIds,
      status,
    }
  }
}

export class StationStep2Parser
  implements IStationStepParser<{ step: 2 } & UpdateAvailabilityInput>
{
  supports(step: number): boolean {
    return step === 2
  }

  async parse(req: AuthenticatedRequest): Promise<{ step: 2 } & UpdateAvailabilityInput> {
    const operatingHours = safeJsonParse(req.body.operatingHours, [])
    const holidays = safeJsonParse(req.body.holidays, [])
    const slotConfig = safeJsonParse(req.body.slotConfig, req.body.slotConfig)

    if (!slotConfig) {
      throw new AppError("slotConfig is required for step 2 availability update", HTTP_STATUS.BAD_REQUEST)
    }

    return {
      step: 2,
      operatingHours,
      holidays,
      slotConfig,
    }
  }
}

export class StationStep3Parser
  implements IStationStepParser<{ step: 3 } & UpsertPricingInput>
{
  supports(step: number): boolean {
    return step === 3
  }

  async parse(req: AuthenticatedRequest): Promise<{ step: 3 } & UpsertPricingInput> {
    const pricing = safeJsonParse(req.body.pricing, [])

    return {
      step: 3,
      pricing,
    }
  }
}

export class StationStep4Parser
  implements IStationStepParser<{ step: 4 } & UpdateAmenitiesInput>
{
  supports(step: number): boolean {
    return step === 4
  }

  async parse(req: AuthenticatedRequest): Promise<{ step: 4 } & UpdateAmenitiesInput> {
    const amenities = safeJsonParse(req.body.amenities, [])
    const extraServices = safeJsonParse(req.body.extraServices, [])

    return {
      step: 4,
      amenities,
      extraServices,
    }
  }
}

export class StationStepParserFactory {
  private readonly parsers: IStationStepParser<UpdateStationInput>[]

  constructor(mediaUploadService: MediaUploadService) {
    this.parsers = [
      new StationStep1Parser(mediaUploadService),
      new StationStep2Parser(),
      new StationStep3Parser(),
      new StationStep4Parser(),
    ]
  }

  getParser(step: number): IStationStepParser<UpdateStationInput> {
    const parser = this.parsers.find((p) => p.supports(step))
    if (!parser) {
      throw new AppError(`Unsupported station update step: ${step}`, HTTP_STATUS.BAD_REQUEST)
    }
    return parser
  }
}
