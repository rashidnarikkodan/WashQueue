import { AppError } from "@/common/errors/app-error"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ValidationError } from "@/common/errors/validation-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { Station } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repsoitory"
import { ISubmitStationUseCase } from "../interfaces/station-usecases.interface"
import { submitStationSchema } from "../../presentation/schema/station.schema"

export class SubmitStationUseCase implements ISubmitStationUseCase {
  constructor(private readonly stationRepository: IStationRepository) {}

  async execute(stationId: string, ownerId: string): Promise<Station> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    if (station.ownerId !== ownerId) {
      throw new ForbiddenError("You are not authorized to submit this station")
    }

    if (station.status !== "DRAFT") {
      throw new AppError("Only draft stations can be submitted for approval", HTTP_STATUS.BAD_REQUEST)
    }

    // Map properties to a plain object for validation.
    // Replace default/empty properties with undefined/null so Zod can detect and reject them.
    const validationData = {
      name: station.name,
      description: station.description || undefined,
      contactPhone: station.contactPhone,
      contactEmail: station.contactEmail,
      location: (station.location?.coordinates?.[0] !== 0 || station.location?.coordinates?.[1] !== 0) 
        ? station.location 
        : undefined,
      address: station.address || undefined,
      pincode: station.pincode || undefined,
      city: station.city || undefined,
      state: station.state || undefined,
      images: station.images.length > 0 ? station.images : undefined,
      bays: station.bays > 0 ? station.bays : undefined,
      avgServiceTime: station.avgServiceTime > 0 ? station.avgServiceTime : undefined,
      operatingHours: station.operatingHours.length > 0 ? station.operatingHours : undefined,
      holidays: station.holidays,
      amenities: station.amenities,
    }

    const validationResult = submitStationSchema.safeParse(validationData)
    if (!validationResult.success) {
      const details = validationResult.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }))
      throw new ValidationError("Station is incomplete for submission", details)
    }

    // Change status to PENDING_APPROVAL
    const updatedStation = await this.stationRepository.update(stationId, {
      status: "PENDING_APPROVAL",
    } as any)

    if (!updatedStation) {
      throw new AppError("Failed to update station status", HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    return updatedStation
  }
}
