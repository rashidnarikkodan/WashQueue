import mongoose from "mongoose"
import { AppError } from "@/common/errors/app-error"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { IStationPricingRepository } from "../../domain/repositories/station-pricing.repository"
import { IExtraServiceRepository } from "../../domain/repositories/extra-service.repository"
import { UpdateStationInput } from "../dtos/update-station.dto"
import { StationDetailResponseDto } from "../dtos/get-station.dto"
import { IUpdateStationUseCase } from "../interfaces/station-usecases.interface"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"

export class UpdateStationUseCase implements IUpdateStationUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository
  ) {}

  async execute(
    stationId: string,
    userId: string,
    updates: UpdateStationInput
  ): Promise<StationDetailResponseDto> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new NotFoundError("Station not found")
    }

    const owner = await this.ownerRepository.findByUserId(userId)

    if (station.ownerId !== owner?.id) {
      throw new ForbiddenError("You are not authorized to update this station")
    }

    // A session to be used for transactions
    const session = await mongoose.startSession()

    try {
      await session.withTransaction(async () => {
        if (updates.step === 1) {
          // Update basic station info if fields are provided
          if (updates.name && updates.contact && updates.location && updates.address) {
            const props = station.getProps()
            station.updateBasicInformation({
              name: updates.name,
              description: updates.description ?? props.description,
              contact: updates.contact,
              location: updates.location,
              address: updates.address,
              images: updates.images ?? props.images,
            })
          }
          if (updates.status) {
            station.updateStatus(updates.status)
          }
          await this.stationRepository.save(station)
        } else if (updates.step === 2) {
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
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error
      }
      const message = error instanceof Error ? error.message : "Failed to update station step"
      throw new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR)
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
