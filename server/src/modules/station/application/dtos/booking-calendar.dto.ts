export type CalendarDateStatus = "AVAILABLE" | "FULL" | "HOLIDAY" | "CLOSED"

export interface CalendarDateEntryDTO {
  date: string // YYYY-MM-DD
  status: CalendarDateStatus
}

export interface BookingCalendarResponseDTO {
  minDate: string
  maxDate: string
  dates: CalendarDateEntryDTO[]
}
