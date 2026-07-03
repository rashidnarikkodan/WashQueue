import "dotenv/config"
import app from "./app"
import env from "./configs/env.config"
import connectDB from "./shared/infrastructure/database/mongodb/connection"
import logger from "./configs/logger.config"
import redis from "./shared/infrastructure/cache/redis.client"

async function startServer() {
  try {
    // Establish database connection
    await connectDB()

    // Test Redis connection
    await redis.ping()

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
