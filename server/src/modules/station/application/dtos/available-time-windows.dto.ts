export interface TimeWindowDTO {
  windowId: string
  start: string // ISO date-time string
  end: string // ISO date-time string
  bookedCount: number
  remainingCapacity: number
  status: "OPEN" | "FULL" | "CLOSED" | "PAST"
}

export interface AvailableTimeWindowsResponseDTO {
  stationId: string
  date: string
  windows: TimeWindowDTO[]
}
