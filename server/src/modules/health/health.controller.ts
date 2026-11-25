import { Request, Response } from "express"
import { HealthService } from "./health.service"
import { HealthDTOMapper } from "./health-dto.mapper"
import success from "@/common/utils/success"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { AppError } from "@/common/errors/app-error"

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  getReport = async (_req: Request, res: Response): Promise<void> => {
    const report = await this.healthService.getFullReport()
    const statusCode =
      report.status === "unhealthy" ? HTTP_STATUS.SERVICE_UNAVAILABLE : HTTP_STATUS.OK

    success(res, HealthDTOMapper.toReportDTO(report), statusCode, `Server is ${report.status}`)
  }

  getLive = async (_req: Request, res: Response): Promise<void> => {
    success(
      res,
      HealthDTOMapper.toLiveDTO(process.uptime()),
      HTTP_STATUS.OK,
      "Server process is alive"
    )
  }

  getReady = async (_req: Request, res: Response): Promise<void> => {
    const isReady = await this.healthService.isReady()
    if (!isReady) {
      throw new AppError(
        "Server is not ready (critical dependencies unavailable)",
        HTTP_STATUS.SERVICE_UNAVAILABLE
      )
    }

    success(res, HealthDTOMapper.toReadyDTO(), HTTP_STATUS.OK, "Server is ready to receive traffic")
  }

  getMetrics = async (_req: Request, res: Response): Promise<void> => {
    const report = await this.healthService.getFullReport()
    success(res, HealthDTOMapper.toMetricsDTO(report), HTTP_STATUS.OK, "Server metrics retrieved")
  }
}
