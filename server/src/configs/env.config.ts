import { configDotenv } from "dotenv"
import z from "zod"
configDotenv()

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production"]),
  LOG_LEVEL: z.string().default("info"),
  MONGODB_URI: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REDIS_HOST: z.string().default("120.0.0.1"),
  REDIS_PORT: z.coerce.number().default(6379),
})
const env = envSchema.parse(process.env)

export default env
