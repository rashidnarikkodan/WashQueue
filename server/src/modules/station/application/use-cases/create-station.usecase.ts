import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { Station, StationImage, StationStatus } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repository"
import { CreateStationInput } from "../dtos/create-station.dto"
import { ICreateStationUseCase } from "../interfaces/station-usecases.interface"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { ForbiddenError } from "@/common/errors/forbidden-error"
import { ERROR_MESSAGES } from "@/common/constants/error.constants"
import { MediaUploadService } from "@/core/application/services/media-upload.service"

export class CreateStationUseCase implements ICreateStationUseCase {
  constructor(
    private readonly stationRepository: IStationRepository,
    private readonly ownerRepository: IOwnerRepository,
    private readonly mediaUploadService?: MediaUploadService
  ) {}

  async execute(userId: string, input: CreateStationInput): Promise<Station> {
    const existingStation = await this.stationRepository.findByName(input.name)
    if (existingStation) {
      throw new AppError("Station with this name already exists", HTTP_STATUS.CONFLICT)
    }

    const owner = await this.ownerRepository.findByUserId(userId)

    if (!owner?.id) {
      throw new ForbiddenError(ERROR_MESSAGES.OWNER_NOT_FOUND)
    }

    if (!owner.isVerified) {
      throw new ForbiddenError("Your owner account is pending approval by an administrator before you can create or manage wash stations.")
    }


    let images: StationImage[] = input.images ? [...input.images] : []

    if (input.newFiles && input.newFiles.length > 0 && this.mediaUploadService) {
      const uploadedImages = await this.mediaUploadService.uploadMultipleFiles(input.newFiles)
      const newStationImages: StationImage[] = uploadedImages.map((img, idx) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: images.length === 0 && idx === 0,
      }))
      images = [...images, ...newStationImages]
    }

    if (images.length === 0) {
      throw new AppError("At least one image is required", HTTP_STATUS.BAD_REQUEST)
    }

    const station = new Station({
      id: "",
      ownerId: owner?.id,
      name: input.name,
      description: input.description ?? "",
      contact: {
        phone: input.contact.phone,
        email: input.contact.email,
      },
      location: {
        latitude: input.location.latitude,
        longitude: input.location.longitude,
      },
      address: {
        street: input.address.street,
        city: input.address.city,
        state: input.address.state,
        country: input.address.country,
        pincode: input.address.pincode,
      },
      images: images.map((img) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: img.isPrimary ?? false,
      })),
      operatingHours: [],
      holidays: [],
      slotConfig: {
        bays: 0,
        windowDurationMins: 0,
        capacityPerWindow: 0,
        walkInReservedSlots: 0,
        maxAdvanceBookingDays: 0,
        bufferBetweenWindowsMins: 0,
        allowWalkIns: false,
      },
      amenities: [],
      rating: 0,
      reviewCount: 0,
      status: StationStatus.DRAFT,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return this.stationRepository.save(station)
  }
}
