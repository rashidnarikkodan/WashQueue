import { configDotenv } from "dotenv"
import z from "zod"
configDotenv()

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.string().default("info"),
  MONGODB_URI: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.coerce.number(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.coerce.number(),
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().default(6379),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("no-reply@washqueue.com"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  CLIENT_URL: z.string(),
  STORAGE_PROVIDER: z.enum(["cloudinary", "s3"]).default("cloudinary"),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().default("washqueue-media"),
  AWS_CLOUDFRONT_DOMAIN: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
  PLATFORM_COMMISSION_RATE: z.coerce.number().default(0.1),
  PLATFORM_COMMISSION_CAP: z.coerce.number().default(150),
  RAZORPAYX_ACCOUNT_NUMBER: z.string(),
  RAZORPAYX_WEBHOOK_SECRET: z.string(),
  AI_EMBEDDING_MODEL: z.string().default("embeddinggemma"),
  OLLAMA_LLM_MODEL: z.string().default("qwen2.5:3b"),
  OLLAMA_BASE_URL: z.string().url().default("http://localhost:11434"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  GEMINI_BASE_URL: z.string().url().default("https://generativelanguage.googleapis.com"),
  QDRANT_URL: z.string().url().default("http://localhost:6333"),
  QDRANT_API_KEY: z.string().optional(),
})
const env = envSchema.parse(process.env)

export default env
