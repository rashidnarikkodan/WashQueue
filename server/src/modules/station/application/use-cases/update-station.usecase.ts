import mongoose from "mongoose"
import { AppError } from "@/common/errors/app-error"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { Station } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repsoitory"
import { IStationPricingRepository } from "../../domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "../../domain/repositories/extra-service.repository"
import { UpdateStationInput } from "../dtos/update-station.dto"
import { StationDetailResponseDto } from "../dtos/get-station.dto"
import { IUpdateStationUseCase } from "../interfaces/station-usecases.interface"

export class UpdateStationUseCase implements IUpdateStationUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository
  ) {}

  async execute(
    stationId: string,
    providerId: string,
    updates: UpdateStationInput
  ): Promise<StationDetailResponseDto> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    if (station.providerId !== providerId) {
      throw new ForbiddenError("You are not authorized to update this station")
    }

    // A session to be used for transactions
    const session = await mongoose.startSession()

    try {
      await session.withTransaction(async () => {
        if (updates.step === 2) {
          // Update operatingHours, holidays, slotConfig
          station.updateAvailability({
            operatingHours: updates.operatingHours,
            holidays: updates.holidays ?? [],
            slotConfig: updates.slotConfig,
          })
          await this.stationRepository.save(station)
        } else if (updates.step === 3) {
          // Upsert station pricing records for every configured vehicle class
          if (updates.pricing && Array.isArray(updates.pricing)) {
            for (const priceEntry of updates.pricing) {
              await this.stationPricingRepository.upsertByStationAndClass(
                stationId,
                priceEntry.vehicleClassId,
                {
                  halfWashPrice: priceEntry.halfWashPrice,
                  fullWashPrice: priceEntry.fullWashPrice,
                  isActive: priceEntry.isActive,
                },
                session
              )
            }
          }
        } else if (updates.step === 4) {
          // Update amenities
          if (updates.amenities) {
            station.updateAmenities(updates.amenities)
            await this.stationRepository.save(station)
          }

          // Create, update, and delete extra services as needed
          if (updates.extraServices && Array.isArray(updates.extraServices)) {
            for (const serviceInput of updates.extraServices) {
              if (serviceInput.isDeleted) {
                if (serviceInput.id) {
                  await this.extraServiceRepository.delete(serviceInput.id, session)
                }
              } else if (serviceInput.id) {
                // Update existing
                await this.extraServiceRepository.update(
                  serviceInput.id,
                  {
                    name: serviceInput.name,
                    description: serviceInput.description,
                    pricing: serviceInput.pricing,
                    isActive: serviceInput.isActive,
                  },
                  session
                )
              } else {
                // Create new
                await this.extraServiceRepository.save(
                  {
                    stationId,
                    name: serviceInput.name,
                    description: serviceInput.description,
                    pricing: serviceInput.pricing,
                    isActive: serviceInput.isActive,
                  },
                  session
                )
              }
            }
          }
        }
      })
    } catch (error: any) {
      throw new AppError(
        error.message || "Failed to update station step",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    } finally {
      await session.endSession()
    }

    // Fetch the updated complete station details
    const updatedStation = await this.stationRepository.findById(stationId)
    if (!updatedStation) {
      throw new NotFoundError("Station not found after update")
    }

    const pricing = await this.stationPricingRepository.findByStationId(stationId)
    const extraServices = await this.extraServiceRepository.findByStationId(stationId)

    return {
      station: updatedStation.getProps(),
      pricing: pricing.map((p) => p.getProps()),
      extraServices: extraServices.map((es) => es.getProps()),
    }
  }
}
