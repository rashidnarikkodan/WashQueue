import cron, { ScheduledTask } from "node-cron"
import logger from "@/configs/logger.config"
import { processPendingSettlementsUseCase } from "@/modules/booking/booking.module"

let task: ScheduledTask | null = null

export function startProcessPendingSettlementsJob(cronExpression: string = "*/5 * * * *"): void {
  if (task) return

  logger.info(
    `[BackgroundJob] Starting pending settlements payout cron job with schedule: ${cronExpression}`
  )

  task = cron.schedule(cronExpression, async () => {
    try {
      await processPendingSettlementsUseCase.execute()
    } catch (error) {
      logger.error({ error }, "[BackgroundJob] Error during pending settlements payout job")
    }
  })
}

export function stopProcessPendingSettlementsJob(): void {
  if (task) {
    task.stop()
    task = null
    logger.info("[BackgroundJob] Pending settlements payout job stopped.")
  }
}
