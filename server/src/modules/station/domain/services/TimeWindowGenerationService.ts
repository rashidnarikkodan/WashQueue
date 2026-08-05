import { Station } from "../entities/Station"
import { SlotConfig } from "../entities/SlotConfig"
import { TimeWindowInstance } from "../entities/TimeWindowInstance"
import { randomUUID } from "node:crypto"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export class TimeWindowGenerationService {
  /**
   * Generates time window instances for a range of dates.
   * Skips holidays and closed operating days.
   * Prevents generating duplicate windows if windowStart already exists in existingStarts.
   */
  generateWindowsForDateRange(
    station: Station,
    slotConfig: SlotConfig,
    startDate: Date,
    endDate: Date,
    existingStarts: Set<string> = new Set()
  ): TimeWindowInstance[] {
    const generated: TimeWindowInstance[] = []
    const now = new Date()

    // Normalize start date and end date to midnight UTC/Local
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const targetEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

    const holidaysSet = new Set(
      (station.holidays || []).map((h: { date: Date; reason?: string }) =>
        this.formatDateISO(new Date(h.date))
      )
    )

    while (current <= targetEnd) {
      const dateStr = this.formatDateISO(current)

      // Skip holidays
      if (holidaysSet.has(dateStr)) {
        current.setDate(current.getDate() + 1)
        continue
      }

      // Check operating hours for day of week
      const dayName = DAY_NAMES[current.getDay()]
      if (!dayName) {
        current.setDate(current.getDate() + 1)
        continue
      }

      const operatingHour = (station.operatingHours || []).find(
        (oh: { day: string; isClosed: boolean; open: string; close: string }) =>
          oh.day.toLowerCase() === dayName.toLowerCase()
      )

      if (!operatingHour || operatingHour.isClosed) {
        current.setDate(current.getDate() + 1)
        continue
      }

      // Parse open & close times (e.g. "09:00", "18:00")
      const [openHour, openMin] = operatingHour.open.split(":").map(Number)
      const [closeHour, closeMin] = operatingHour.close.split(":").map(Number)

      const openDateTime = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate(),
        openHour || 0,
        openMin || 0,
        0,
        0
      )

      const closeDateTime = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate(),
        closeHour || 0,
        closeMin || 0,
        0,
        0
      )

      const durationMs = slotConfig.windowDurationMins * 60 * 1000

      let windowStart = new Date(openDateTime)
      while (windowStart.getTime() + durationMs <= closeDateTime.getTime()) {
        const windowEnd = new Date(windowStart.getTime() + durationMs)
        const windowStartIso = windowStart.toISOString()

        if (!existingStarts.has(windowStartIso)) {
          const status = windowEnd <= now ? "PAST" : "OPEN"

          const instance = new TimeWindowInstance({
            id: randomUUID(),
            stationId: station.id,
            date: dateStr,
            windowStart,
            windowEnd,
            capacityTotal: slotConfig.capacityPerWindow,
            walkInReservedSlots: slotConfig.walkInReservedSlots,
            advanceBookedCount: 0,
            walkInCount: 0,
            status,
            createdAt: now,
            updatedAt: now,
          })

          generated.push(instance)
          existingStarts.add(windowStartIso)
        }

        windowStart = windowEnd
      }

      current.setDate(current.getDate() + 1)
    }

    return generated
  }

  private formatDateISO(d: Date): string {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }
}
