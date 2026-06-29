import express from "express"
import corsConfig from "./configs/cors.config"
import loggerMiddleware from "./shared/middleware/logger.middleware"
import notFoundMiddleware from "./shared/middleware/not-found.middleware"
import errorMiddleware from "./shared/middleware/error.middleware"
import authRouter from "./modules/auth/auth.module"
import userRouter from "@/modules/user/user.module"

const app = express()

app.use(corsConfig)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(loggerMiddleware)


app.use("/api/auth", authRouter)
app.use('/api/users', userRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
