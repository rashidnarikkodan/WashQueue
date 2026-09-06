import "dotenv/config"
import app from "./app"
import env from "./configs/env.config"
import connectDB from "./infrastructure/database/mongodb/connection"
import logger from "./configs/logger.config"
import redis from "./infrastructure/cache/redis.client"
import { startReservationCleanupJob } from "./infrastructure/jobs/reservation-cleanup.job"
import { startNoShowCleanupJob } from "./infrastructure/jobs/no-show-cleanup.job"
import { startProcessPendingSettlementsJob } from "./infrastructure/jobs/process-pending-settlements.job"

import { createServer } from "http"
import { SocketServerService } from "./infrastructure/websocket/socket-server.service"

async function startServer() {
  try {
    await connectDB()

    await redis.ping()

    startReservationCleanupJob()
    startNoShowCleanupJob()
    startProcessPendingSettlementsJob()

    const httpServer = createServer(app)
    SocketServerService.getInstance().init(httpServer)

    httpServer.listen(env.PORT, () => {
      logger.info(`Server running with Socket.IO at http://localhost:${env.PORT}`)
    })
  } catch (error) {
    logger.error({ error }, "Failed to start the server")
    process.exit(1)
  }
}

startServer()
