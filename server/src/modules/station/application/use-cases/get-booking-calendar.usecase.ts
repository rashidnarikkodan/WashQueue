import { IStationRepository } from "../../domain/repositories/station.repository"
import { ISlotConfigRepository } from "../../domain/repositories/slot-config.repository"
import { ITimeWindowRepository } from "../../domain/repositories/time-window.repository"
import { EnsureBookingHorizonService } from "../services/ensure-booking-horizon.service"
import { BookingCalendarResponseDTO, CalendarDateEntryDTO } from "../dtos/booking-calendar.dto"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { IGetBookingCalendarUseCase } from "../interfaces/station-usecases.interface"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export class GetBookingCalendarUseCase implements IGetBookingCalendarUseCase {
  constructor(
    private stationRepository: IStationRepository,
    private slotConfigRepository: ISlotConfigRepository,
    private timeWindowRepository: ITimeWindowRepository,
    private ensureBookingHorizonService: EnsureBookingHorizonService
  ) {}

  async execute(stationId: string): Promise<BookingCalendarResponseDTO> {
    const station = await this.stationRepository.findById(stationId)
    if (!station) {
      throw new AppError("Station not found", HTTP_STATUS.NOT_FOUND)
    }

    await this.ensureBookingHorizonService.ensureBookingHorizon(stationId)

    const slotConfig = await this.slotConfigRepository.findByStationId(stationId)
    const maxAdvanceDays = slotConfig
      ? slotConfig.maxAdvanceBookingDays
      : station.getProps().slotConfig?.maxAdvanceBookingDays || 7

    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + maxAdvanceDays)

    const minDateStr = this.formatDateISO(today)
    const maxDateStr = this.formatDateISO(endDate)

    const windows = await this.timeWindowRepository.findByStationIdAndDateRange(
      stationId,
      minDateStr,
      maxDateStr
    )

    const windowsByDate = new Map<string, typeof windows>()
    for (const w of windows) {
      const existing = windowsByDate.get(w.date) || []
      existing.push(w)
      windowsByDate.set(w.date, existing)
    }

    const holidaysSet = new Set(
      (station.holidays || []).map((h: { date: Date; reason?: string }) =>
        this.formatDateISO(new Date(h.date))
      )
    )

    const dates: CalendarDateEntryDTO[] = []
    const current = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const targetEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

    while (current <= targetEnd) {
      const dateStr = this.formatDateISO(current)

      if (holidaysSet.has(dateStr)) {
        dates.push({ date: dateStr, status: "HOLIDAY" })
      } else {
        const dayName = DAY_NAMES[current.getDay()]
        if (!dayName) {
          current.setDate(current.getDate() + 1)
          continue
        }

        const operatingHour = (station.operatingHours || []).find(
          (oh: { day: string; isClosed: boolean }) => oh.day.toLowerCase() === dayName.toLowerCase()
        )

        if (!operatingHour || operatingHour.isClosed) {
          dates.push({ date: dateStr, status: "CLOSED" })
        } else {
          const dateWindows = windowsByDate.get(dateStr) || []
          const hasAvailableWindow = dateWindows.some((w) => w.isBookable)

          dates.push({
            date: dateStr,
            status: hasAvailableWindow ? "AVAILABLE" : "FULL",
          })
        }
      }

      current.setDate(current.getDate() + 1)
    }

    return {
      minDate: minDateStr,
      maxDate: maxDateStr,
      dates,
    }
  }

  private formatDateISO(d: Date): string {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }
}
