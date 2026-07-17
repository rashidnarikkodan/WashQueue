import env from "@/configs/env.config"
import Redis from "ioredis"
import logger from "@/configs/logger.config"

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
})

redis.on("connect", () => {
  logger.info("Redis connected successfully")
})
redis.on("error", (error) => {
  logger.error({ error }, "Error connecting to Redis")
})

export default redis
