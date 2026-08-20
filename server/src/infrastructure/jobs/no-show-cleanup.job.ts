import logger from "@/configs/logger.config"
import { processNoShowBookingsUseCase } from "@/modules/booking/booking.module"

let intervalId: NodeJS.Timeout | null = null

export function startNoShowCleanupJob(intervalMs: number = 300000): void {
  if (intervalId) return

  logger.info("[BackgroundJob] Starting No-Show cleanup background worker...")

  intervalId = setInterval(async () => {
    try {
      await processNoShowBookingsUseCase.execute(10)
    } catch (error) {
      logger.error({ error }, "[BackgroundJob] Error during No-Show cleanup worker execution")
    }
  }, intervalMs)
}

export function stopNoShowCleanupJob(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
    logger.info("[BackgroundJob] No-Show cleanup job stopped.")
  }
}
