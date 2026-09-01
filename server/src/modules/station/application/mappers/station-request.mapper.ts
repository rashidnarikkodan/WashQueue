import { Request } from "express"
import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { CreateStationInput } from "../dtos/create-station.dto"
import { UpdateStationInput } from "../dtos/update-station.dto"
import { StationStepParserFactory, safeJsonParse } from "./station-step.parser"
import { StationImage } from "../../domain/entities/Station"

export interface ReviewStationRequestInput {
  action: "APPROVE" | "REJECT" | "SUSPEND"
  rejectionReason?: string
}

export class StationRequestMapper {
  constructor(private readonly stepParserFactory: StationStepParserFactory) {}

  extractStationId(req: Request | AuthenticatedRequest): string {
    const rawStationId = req.params.stationId || req.params.id
    const candidateStationId = Array.isArray(rawStationId) ? rawStationId[0] : rawStationId
    if (
      !candidateStationId ||
      typeof candidateStationId !== "string" ||
      !candidateStationId.trim()
    ) {
      throw new AppError("Station ID is required", HTTP_STATUS.BAD_REQUEST)
    }
    return candidateStationId.trim()
  }

  extractReviewInput(req: AuthenticatedRequest): ReviewStationRequestInput {
    const { action, rejectionReason } = req.body
    if (action !== "APPROVE" && action !== "REJECT" && action !== "SUSPEND") {
      throw new AppError("Action must be APPROVE, REJECT, or SUSPEND", HTTP_STATUS.BAD_REQUEST)
    }
    return {
      action,
      rejectionReason,
    }
  }

  mapToCreateInput(req: AuthenticatedRequest): CreateStationInput {
    const { name, description } = req.body

    const contact = safeJsonParse(req.body.contact, req.body.contact)
    const location = safeJsonParse(req.body.location, req.body.location)
    const address = safeJsonParse(req.body.address, req.body.address)
    const images: StationImage[] = safeJsonParse(req.body.images, [])

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

  async mapToUpdateInput(req: AuthenticatedRequest): Promise<UpdateStationInput> {
    const rawStep = req.body.step ?? "1"
    const step = typeof rawStep === "number" ? rawStep : parseInt(rawStep, 10)
    const parser = this.stepParserFactory.getParser(step)
    return parser.parse(req)
  }
}
