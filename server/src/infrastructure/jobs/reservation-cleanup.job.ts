import logger from "@/configs/logger.config"
import { cleanupExpiredReservationsUseCase } from "@/modules/booking/booking.module"

let intervalId: NodeJS.Timeout | null = null

export function startReservationCleanupJob(intervalMs: number = 60000): void {
  if (intervalId) return

  logger.info("[BackgroundJob] Starting reservation cleanup background job...")

  intervalId = setInterval(async () => {
    try {
      await cleanupExpiredReservationsUseCase.execute()
    } catch (error) {
      logger.error({ error }, "[BackgroundJob] Error during reservation cleanup job")
    }
  }, intervalMs)
}

export function stopReservationCleanupJob(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
    logger.info("[BackgroundJob] Reservation cleanup job stopped.")
  }
}
