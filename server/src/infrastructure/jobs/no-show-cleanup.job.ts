import cron, { ScheduledTask } from "node-cron"
import logger from "@/configs/logger.config"
import { processNoShowBookingsUseCase } from "@/modules/queue/queue.module"

let task: ScheduledTask | null = null

export function startNoShowCleanupJob(cronExpression: string = "*/5 * * * *"): void {
  if (task) return

  logger.info(`[BackgroundJob] Starting No-Show cleanup cron job with schedule: ${cronExpression}`)

  task = cron.schedule(cronExpression, async () => {
    try {
      await processNoShowBookingsUseCase.execute(10)
    } catch (error) {
      logger.error({ error }, "[BackgroundJob] Error during No-Show cleanup worker execution")
    }
  })
}

export function stopNoShowCleanupJob(): void {
  if (task) {
    task.stop()
    task = null
    logger.info("[BackgroundJob] No-Show cleanup job stopped.")
  }
}
