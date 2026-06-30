import express from "express"
import cookieParser from "cookie-parser"
import corsConfig from "./configs/cors.config"
import loggerMiddleware from "./shared/middleware/logger.middleware"
import notFoundMiddleware from "./shared/middleware/not-found.middleware"
import errorMiddleware from "./shared/middleware/error.middleware"
import authRouter from "./modules/auth/auth.module"
import userRouter from "@/modules/user/user.module"
import { API_ROUTES } from "@/shared/constants/route.constants"

const app = express()

app.use(corsConfig)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(loggerMiddleware)


app.use(API_ROUTES.AUTH.ROOT, authRouter)
app.use(API_ROUTES.USERS.ROOT, userRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
