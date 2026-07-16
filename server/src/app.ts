import express from "express"
import path from "path"
import cookieParser from "cookie-parser"
import corsConfig from "./configs/cors.config"
import loggerMiddleware from "./infrastructure/http/middleware/logger.middleware"
import notFoundMiddleware from "./infrastructure/http/middleware/not-found.middleware"
import errorMiddleware from "./infrastructure/http/middleware/error.middleware"
import authRouter from "./modules/auth/auth.module"
import userRouter from "@/modules/user/user.module"
import ownerRouter from "@/modules/owner/owner.module"
import vehicleRouter from "@/modules/vehicle-catelog/vehicle.module"
import { API_ROUTES } from "@/common/constants/route.constants"

const app = express()

app.use(corsConfig)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(loggerMiddleware)

// Serve uploaded files
app.use("/uploads", express.static(path.resolve("uploads")))

app.use(API_ROUTES.AUTH.ROOT, authRouter)
app.use(API_ROUTES.USERS.ROOT, userRouter)
app.use(API_ROUTES.OWNER.ROOT, ownerRouter)
app.use(API_ROUTES.VEHICLE_CATALOG.ROOT, vehicleRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
