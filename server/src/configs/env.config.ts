import { configDotenv } from "dotenv";
import z from "zod";
configDotenv()

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(["development","production"]),
})
const env = envSchema.parse(process.env)

export default env