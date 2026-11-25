import pino from "pino"
import env from "./env.config"

const logger = pino({
  level: env.LOG_LEVEL,
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
  transport:
    env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
})

export default logger
