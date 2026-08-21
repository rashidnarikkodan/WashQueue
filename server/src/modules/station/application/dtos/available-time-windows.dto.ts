export interface TimeWindowDTO {
  windowId: string
  start: string
  end: string
  bookedCount: number
  remainingCapacity: number
  status: "OPEN" | "FULL" | "CLOSED" | "PAST"
}

export interface AvailableTimeWindowsResponseDTO {
  stationId: string
  date: string
  windows: TimeWindowDTO[]
}
