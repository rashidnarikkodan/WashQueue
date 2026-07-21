import express from "express"
import cookieParser from "cookie-parser"
import corsConfig from "./configs/cors.config"
import loggerMiddleware from "./infrastructure/http/middleware/logger.middleware"
import notFoundMiddleware from "./infrastructure/http/middleware/not-found.middleware"
import errorMiddleware from "./infrastructure/http/middleware/error.middleware"
import authRouter from "./modules/auth/auth.module"
import userRouter from "@/modules/user/user.module"
import ownerRouter from "@/modules/owner/owner.module"
import vehicleRouter from "@/modules/vehicle-catelog/vehicle.module"
import stationRouter from "@/modules/station/station.module"
import userVehicleRouter from "@/modules/vehicle/vehicle.module"
import { API_ROUTES } from "@/common/constants/route.constants"

const app = express()

app.use(corsConfig)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))
app.use(cookieParser())
app.use(loggerMiddleware)

app.use(API_ROUTES.AUTH.ROOT, authRouter)
app.use(API_ROUTES.USERS.ROOT, userRouter)
app.use(API_ROUTES.OWNER.ROOT, ownerRouter)
app.use(API_ROUTES.VEHICLE_CATALOG.ROOT, vehicleRouter)
app.use(API_ROUTES.STATIONS.ROOT, stationRouter)
app.use(API_ROUTES.VEHICLES.ROOT, userVehicleRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
