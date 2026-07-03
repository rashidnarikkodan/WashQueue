import env from "@/configs/env.config"
import mongoose from "mongoose"
import logger from "@/configs/logger.config"

const dbConfig = {
  uri: env.MONGODB_URI,
}

async function connect() {
  try {
    await mongoose.connect(dbConfig.uri)
    logger.info("MongoDB connected successfully")
  } catch (error) {
    logger.error({ error }, "Error connecting to MongoDB")
    throw error
  }
}

export default connect
