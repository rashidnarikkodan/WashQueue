import env from "@/configs/env.config"
import logger from "@/configs/logger.config"
import { QdrantClient } from "@qdrant/js-client-rest"

export const qdrant = new QdrantClient({ url: env.QDRANT_URL })

import { VECTOR_COLLECTIONS } from "@/common/constants/vector-collections.constants"

export async function initializeQdrant() {
  const collectionName = VECTOR_COLLECTIONS.KNOWLEDGE_DOCUMENT
  const collectionInfo = await qdrant.collectionExists(collectionName)
  if (!collectionInfo.exists) {
    await qdrant.createCollection(collectionName, {
      vectors: {
        size: 768,
        distance: "Cosine",
      },
    })
    logger.info("Qdrant DB Initialized")
  } else {
    logger.info("Qdrant DB Already Initialized")
  }
}
