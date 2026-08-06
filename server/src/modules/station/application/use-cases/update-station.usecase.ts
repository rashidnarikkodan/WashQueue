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
import { IManagerAssignmentRepository } from "@/modules/manager/domain/repositories/manager-assignment.repository"
import { ManagerPermission } from "@/modules/manager/domain/entities/ManagerAssignment"
import { IMediaStorage } from "@/core/application/interfaces/media.interface"
import { MediaUploadService } from "@/core/application/services/media-upload.service"
import { StationImage } from "../../domain/entities/Station"

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
}

import { ISlotConfigRepository } from "../../domain/repositories/slot-config.repository"
import { GenerateTimeWindowsUseCase } from "./generate-time-windows.usecase"
import { SlotConfig } from "../../domain/entities/SlotConfig"
import { randomUUID } from "node:crypto"

export class UpdateStationUseCase implements IUpdateStationUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly stationPricingRepository: IStationPricingRepository,
    private readonly extraServiceRepository: IExtraServiceRepository,
    private readonly mediaStorage?: IMediaStorage,
    private readonly mediaUploadService?: MediaUploadService,
    private readonly managerAssignmentRepository?: IManagerAssignmentRepository,
    private readonly slotConfigRepository?: ISlotConfigRepository,
    private readonly generateTimeWindowsUseCase?: GenerateTimeWindowsUseCase
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
    let isAuthorized = false

    if (owner && station.ownerId === owner.id) {
      if (!owner.isVerified) {
        throw new ForbiddenError(
          "Your owner account is pending approval by an administrator before you can modify stations."
        )
      }
      isAuthorized = true
    } else if (this.managerAssignmentRepository) {
      const assignment = await this.managerAssignmentRepository.findByUserAndStation(
        userId,
        stationId
      )
      if (
        assignment &&
        assignment.isActive &&
        assignment.hasPermission(ManagerPermission.STATION_SETTINGS)
      ) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      throw new ForbiddenError("You are not authorized to update this station")
    }


    // A session to be used for transactions
    const session = await mongoose.startSession()

    try {
      await session.withTransaction(async () => {
        if (updates.step === 1) {
          // Delete removed images from media storage if specified
          if (updates.deletedImagePublicIds && updates.deletedImagePublicIds.length > 0 && this.mediaStorage) {
            for (const pubId of updates.deletedImagePublicIds) {
              try {
                await this.mediaStorage.delete(pubId)
              } catch (err) {
                console.warn(`Failed to delete media asset ${pubId}:`, err)
              }
            }
          }

          // Process new file uploads if provided
          const props = station.getProps()
          let currentImages: StationImage[] = updates.images ?? props.images
          if (updates.newFiles && updates.newFiles.length > 0 && this.mediaUploadService) {
            const uploaded = await this.mediaUploadService.uploadMultipleFiles(updates.newFiles)
            const newStationImages: StationImage[] = uploaded.map((img, idx) => ({
              url: img.url,
              publicId: img.publicId,
              isPrimary: currentImages.length === 0 && idx === 0,
            }))
            currentImages = [...currentImages, ...newStationImages]
          }

          // Update basic station info if any basic info field is provided
          if (
            updates.name ||
            updates.description !== undefined ||
            updates.contact ||
            updates.location ||
            updates.address ||
            updates.images ||
            updates.newFiles
          ) {
            station.updateBasicInformation({
              name: updates.name ?? props.name,
              description: updates.description ?? props.description,
              contact: updates.contact ?? props.contact,
              location: updates.location ?? props.location,
              address: updates.address ?? props.address,
              images: currentImages,
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

          if (updates.slotConfig && this.slotConfigRepository) {
            const existingConfig = await this.slotConfigRepository.findByStationId(stationId)
            const now = new Date()
            const configToSave = new SlotConfig({
              id: existingConfig?.id || randomUUID(),
              stationId,
              windowDurationMins: updates.slotConfig.windowDurationMins,
              capacityPerWindow: updates.slotConfig.capacityPerWindow,
              walkInReservedSlots: updates.slotConfig.walkInReservedSlots,
              maxAdvanceBookingDays: updates.slotConfig.maxAdvanceBookingDays,
              allowWalkIns: updates.slotConfig.allowWalkIns,
              createdAt: existingConfig?.createdAt || now,
              updatedAt: now,
            })
            await this.slotConfigRepository.save(configToSave)
          }

          if (this.generateTimeWindowsUseCase) {
            await this.generateTimeWindowsUseCase.execute(stationId, true)
          }
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

          // Create, update, and delete extra services with slug validation & duplicate checks
          if (updates.extraServices && Array.isArray(updates.extraServices)) {
            const existingExtraServices = await this.extraServiceRepository.findByStationId(stationId, session)
            const activeServices = updates.extraServices.filter((s) => !s.isDeleted)

            // Validate duplicates within incoming payload by name or slug
            const seenNames = new Set<string>()
            const seenSlugs = new Set<string>()

            for (const serviceInput of activeServices) {
              const nameKey = serviceInput.name.toLowerCase().trim()
              let slugVal = serviceInput.slug || slugify(serviceInput.name)

              if (seenSlugs.has(slugVal)) {
                slugVal = `${slugVal}-${seenSlugs.size + 1}`
                serviceInput.slug = slugVal
              }

              seenNames.add(nameKey)
              seenSlugs.add(slugVal)
            }

            const processedIds = new Set<string>()

            for (const serviceInput of updates.extraServices) {
              const generatedSlug = serviceInput.slug || slugify(serviceInput.name)
              const nameKey = serviceInput.name.toLowerCase().trim()

              if (serviceInput.isDeleted) {
                const existing = serviceInput.id
                  ? existingExtraServices.find((e) => e.id === serviceInput.id)
                  : existingExtraServices.find(
                      (e) => !processedIds.has(e.id) && (e.getProps().slug === generatedSlug || e.getProps().name.toLowerCase().trim() === nameKey)
                    )

                if (existing) {
                  processedIds.add(existing.id)
                  await this.extraServiceRepository.delete(existing.id, session)
                }
              } else {
                // Check if existing record exists by ID or by slug/name matching
                const existing = serviceInput.id
                  ? existingExtraServices.find((e) => e.id === serviceInput.id)
                  : existingExtraServices.find(
                      (e) => !processedIds.has(e.id) && (e.getProps().slug === generatedSlug || e.getProps().name.toLowerCase().trim() === nameKey)
                    )

                if (existing) {
                  processedIds.add(existing.id)
                  // Update existing record (prevents duplicates!)
                  await this.extraServiceRepository.update(
                    existing.id,
                    {
                      name: serviceInput.name,
                      slug: generatedSlug,
                      description: serviceInput.description,
                      pricing: serviceInput.pricing,
                      isActive: serviceInput.isActive,
                    },
                    session
                  )
                } else {
                  // Create new record
                  const created = await this.extraServiceRepository.save(
                    {
                      stationId,
                      name: serviceInput.name,
                      slug: generatedSlug,
                      description: serviceInput.description,
                      pricing: serviceInput.pricing,
                      isActive: serviceInput.isActive,
                    },
                    session
                  )
                  if (created && created.id) {
                    processedIds.add(created.id)
                  }
                }
              }
            }

            // Clean up any remaining duplicate/orphaned extra services in DB for this station
            for (const existing of existingExtraServices) {
              if (!processedIds.has(existing.id)) {
                await this.extraServiceRepository.delete(existing.id, session)
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
