import { Request, Response, NextFunction } from "express"
import logger from "../../configs/logger.config"

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()

  logger.info(
    {
      method: req.method,
      url: req.url,
      ip: req.ip,
    },
    `Incoming: ${req.method} ${req.url}`
  )

  res.on("finish", () => {
    const duration = Date.now() - start
    const msg = `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`

    if (res.statusCode >= 500) {
      logger.error(
        {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
        },
        msg
      )
    } else if (res.statusCode >= 400) {
      logger.warn(
        {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
        },
        msg
      )
    } else {
      logger.info(
        {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
        },
        msg
      )
    }
  })

  next()
}

export default loggerMiddleware
