export interface ConfigureSlotConfigInput {
  stationId: string
  windowDurationMins: number
  capacityPerWindow: number
  walkInReservedSlots: number
  maxAdvanceBookingDays: number
  allowWalkIns: boolean
}

export interface SlotConfigResponseDTO {
  id: string
  stationId: string
  windowDurationMins: number
  capacityPerWindow: number
  walkInReservedSlots: number
  maxAdvanceBookingDays: number
  allowWalkIns: boolean
  createdAt: string
  updatedAt: string
}
