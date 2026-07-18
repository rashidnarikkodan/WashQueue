import { StationProps } from "../../domain/entities/Station"

export type UpdateStationInput = Partial<Omit<StationProps, "id" | "ownerId" | "status" | "createdAt" | "rating" | "reviewCount">>
