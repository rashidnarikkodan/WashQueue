import { Request, Response } from "express"
import { HealthService } from "./health.service"
import success from "@/common/utils/success"
import { HTTP_STATUS } from "@/common/constants/http.constants"

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  getReport = async (_req: Request, res: Response): Promise<void> => {
    const report = await this.healthService.getFullReport()
    const statusCode =
      report.status === "unhealthy" ? HTTP_STATUS.SERVICE_UNAVAILABLE : HTTP_STATUS.OK

    success(res, report, statusCode, `Server is ${report.status}`)
  }

  getLive = async (_req: Request, res: Response): Promise<void> => {
    success(
      res,
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
      },
      HTTP_STATUS.OK,
      "Server process is alive"
    )
  }

  getReady = async (_req: Request, res: Response): Promise<void> => {
    const isReady = await this.healthService.isReady()
    if (!isReady) {
      res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        success: false,
        message: "Server is not ready (critical dependencies unavailable)",
        timestamp: new Date().toISOString(),
      })
      return
    }

    success(
      res,
      {
        status: "ready",
        timestamp: new Date().toISOString(),
      },
      HTTP_STATUS.OK,
      "Server is ready to receive traffic"
    )
  }

  getMetrics = async (_req: Request, res: Response): Promise<void> => {
    const report = await this.healthService.getFullReport()
    success(
      res,
      {
        uptime: report.uptime,
        memory: report.system.memory,
        cpu: report.system.cpu,
        services: {
          mongodb: {
            status: report.services.mongodb.status,
            latencyMs: report.services.mongodb.latencyMs,
          },
          redis: {
            status: report.services.redis.status,
            latencyMs: report.services.redis.latencyMs,
          },
          qdrant: {
            status: report.services.qdrant.status,
            latencyMs: report.services.qdrant.latencyMs,
          },
          ollama: {
            status: report.services.ollama.status,
            latencyMs: report.services.ollama.latencyMs,
          },
        },
      },
      HTTP_STATUS.OK,
      "Server metrics retrieved"
    )
  }
}
