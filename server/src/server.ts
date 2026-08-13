import "dotenv/config"
import app from "./app"
import env from "./configs/env.config"
import connectDB from "./infrastructure/database/mongodb/connection"
import logger from "./configs/logger.config"
import redis from "./infrastructure/cache/redis.client"
import { startReservationCleanupJob } from "./infrastructure/jobs/reservation-cleanup.job"
import { startNoShowCleanupJob } from "./infrastructure/jobs/no-show-cleanup.job"

async function startServer() {
  try {
    // Establish database connection
    await connectDB()

    // Test Redis connection
    await redis.ping()

    // Start background cleanup jobs
    startReservationCleanupJob(60000)
    startNoShowCleanupJob(300000)

    // Start Express listener
    app.listen(env.PORT, () => {
      logger.info(`Server running at http://localhost:${env.PORT}`)
    })
  } catch (error) {
    logger.error({ error }, "Failed to start the server")
    process.exit(1)
  }
}

startServer()
