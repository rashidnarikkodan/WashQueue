import { Router } from "express"
import { HealthService } from "./health.service"
import { HealthController } from "./health.controller"
import { createHealthRoutes } from "./health.routes"

const healthService = new HealthService()
const healthController = new HealthController(healthService)
const healthRouter: Router = createHealthRoutes(healthController)

export { healthService, healthController }
export default healthRouter
