import { configDotenv } from "dotenv"
import z from "zod"
configDotenv()

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production"]),
  LOG_LEVEL: z.string().default("info"),
  MONGODB_URI: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.coerce.number(), // 15 mins in seconds
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.coerce.number(), // 7 days in seconds
  REDIS_HOST: z.string().default("120.0.0.1"),
  REDIS_PORT: z.coerce.number().default(6379),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("no-reply@washqueue.com"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  CLIENT_URL: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
})
const env = envSchema.parse(process.env)

export default env
