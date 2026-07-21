import { AuthenticatedRequest } from "@/infrastructure/http/middleware/authenticate"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { CreateStationInput } from "../../application/dtos/create-station.dto"
import { UpdateStationInput } from "../../application/dtos/update-station.dto"

export class StationRequestMapper {
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
   * Maps request body to CreateStationInput DTO.
   */
  mapToCreateInput(req: AuthenticatedRequest): CreateStationInput {
    return req.body as CreateStationInput
  }

  /**
   * Maps request body to UpdateStationInput DTO.
   */
  mapToUpdateInput(req: AuthenticatedRequest): UpdateStationInput {
    return req.body as UpdateStationInput
  }
}
