import env from "@/configs/env.config"
import logger from "@/configs/logger.config"
import { QdrantClient } from "@qdrant/js-client-rest"

export const qdrant = new QdrantClient({ url: env.QDRANT_URL })

export async function initializeQdrant() {
  const knowledge_documents = await qdrant.collectionExists("knowledge_documents")
  if (!knowledge_documents.exists) {
    await qdrant.createCollection("knowledge_documents", {
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
