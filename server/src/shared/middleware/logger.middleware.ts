import { Request, Response, NextFunction } from "express"
import logger from "../../configs/logger.config"

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()

  // Log incoming request (including query parameters & parsed body)
  logger.info(
    {
      method: req.method,
      url: req.url,
      ip: req.ip,
      query: req.query,
      body: req.body,
    },
    `Incoming: ${req.method} ${req.url}`
  )

  // Intercept the response body
  const originalSend = res.send
  let responseBody: unknown

  res.send = function (body?: unknown) {
    responseBody = body
    return originalSend.call(res, body)
  }

  res.on("finish", () => {
    const duration = Date.now() - start
    const msg = `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`

    let parsedResponseBody = responseBody
    try {
      if (typeof responseBody === "string") {
        parsedResponseBody = JSON.parse(responseBody)
      }
    } catch {
      // Leave as string if it is not valid JSON
    }

    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      response: parsedResponseBody,
    }

    if (res.statusCode >= 500) {
      logger.error(logData, msg)
    } else if (res.statusCode >= 400) {
      logger.warn(logData, msg)
    } else {
      logger.info(logData, msg)
    }
  })

  next()
}

export default loggerMiddleware
