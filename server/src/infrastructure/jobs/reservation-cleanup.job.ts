import cron, { ScheduledTask } from "node-cron"
import logger from "@/configs/logger.config"
import { cleanupExpiredReservationsUseCase } from "@/modules/payment/payment.module"

let task: ScheduledTask | null = null

export function startReservationCleanupJob(cronExpression: string = "* * * * *"): void {
  if (task) return

  logger.info(`[BackgroundJob] Starting reservation cleanup cron job with schedule: ${cronExpression}`)

  task = cron.schedule(cronExpression, async () => {
    try {
      await cleanupExpiredReservationsUseCase.execute()
    } catch (error) {
      logger.error({ error }, "[BackgroundJob] Error during reservation cleanup job")
    }
  })
}

export function stopReservationCleanupJob(): void {
  if (task) {
    task.stop()
    task = null
    logger.info("[BackgroundJob] Reservation cleanup job stopped.")
  }
}
