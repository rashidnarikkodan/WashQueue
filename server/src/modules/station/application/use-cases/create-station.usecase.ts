import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { Station, StationStatus } from "../../domain/entities/Station"
import { IStationRepository } from "../../domain/repositories/station.repsoitory"
import { CreateStationInput } from "../dtos/create-station.dto"
import { ICreateStationUseCase } from "../interfaces/station-usecases.interface"

export class CreateStationUseCase implements ICreateStationUseCase {
  constructor(private readonly stationRepository: IStationRepository) {}

  async execute(input: CreateStationInput): Promise<Station> {
    const existingStation = await this.stationRepository.findByName(input.name)
    if (existingStation) {
      throw new AppError("Station with this name already exists", HTTP_STATUS.CONFLICT)
    }

    const station = new Station({
      id: "",
      providerId: input.providerId,
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
      images: input.images.map((img) => ({
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