import { randomInt } from "node:crypto"

export class BookingNumberService {
  /**
   * Generates a unique human-readable booking number: WQ-YYYYMMDD-XXXXXX
   */
  static generate(date: Date = new Date()): string {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const dd = String(date.getDate()).padStart(2, "0")

    const dateStr = `${yyyy}${mm}${dd}`
    const randomSeq = String(randomInt(100000, 999999))

    return `WQ-${dateStr}-${randomSeq}`
  }
}
