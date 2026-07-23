import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { CreateStationInput } from "../../application/dtos/create-station.dto"
import { UpdateStationInput } from "../../application/dtos/update-station.dto"
import { StationStepParserFactory, safeJsonParse } from "../parsers/station-step.parser"
import { StationImage } from "../../domain/entities/Station"

export interface ReviewStationRequestInput {
  action: "APPROVE" | "REJECT"
  rejectionReason?: string
}

export class StationRequestMapper {
  constructor(private readonly stepParserFactory: StationStepParserFactory) {}

  /**
   * Safely extracts and validates stationId from route params.
   */
  extractStationId(req: AuthenticatedRequest): string {
    const { stationId } = req.params
    if (!stationId) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }
    return stationId
  }

  /**
   * Extracts admin review action parameters.
   */
  extractReviewInput(req: AuthenticatedRequest): ReviewStationRequestInput {
    const { action, rejectionReason } = req.body
    if (action !== "APPROVE" && action !== "REJECT") {
      throw new AppError("Action must be either APPROVE or REJECT", HTTP_STATUS.BAD_REQUEST)
    }
    return {
      action,
      rejectionReason,
    }
  }

  /**
   * Maps multipart/form-data or JSON request body + uploaded files to CreateStationInput DTO.
   */
  mapToCreateInput(req: AuthenticatedRequest): CreateStationInput {
    const { name, description } = req.body

    const contact = safeJsonParse(req.body.contact, req.body.contact)
    const location = safeJsonParse(req.body.location, req.body.location)
    const address = safeJsonParse(req.body.address, req.body.address)
    const images: StationImage[] = safeJsonParse(req.body.images, [])

    // Process uploaded file images
    const files = req.files
    let multerFiles: Express.Multer.File[] = []
    if (Array.isArray(files)) {
      multerFiles = files
    } else if (files && typeof files === "object") {
      multerFiles = Object.values(files).flat()
    }

    return {
      name,
      description,
      contact,
      location,
      address,
      images: images.length > 0 ? images : undefined,
      newFiles: multerFiles.length > 0 ? multerFiles : undefined,
    }
  }

  /**
   * Delegates step-based update request parsing to the matching step strategy.
   */
  async mapToUpdateInput(req: AuthenticatedRequest): Promise<UpdateStationInput> {
    const rawStep = req.body.step ?? "1"
    const step = typeof rawStep === "number" ? rawStep : parseInt(rawStep, 10)
    const parser = this.stepParserFactory.getParser(step)
    return parser.parse(req)
  }
}
