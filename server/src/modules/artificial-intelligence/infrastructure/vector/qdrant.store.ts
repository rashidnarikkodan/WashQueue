import { VECTOR_COLLECTIONS } from "@/common/constants/vector-collections.constants"
import {
  IVectorStore,
  RetrievedChunk,
  VectorChunk,
  VectorChunkMetadata,
  VectorSearchOptions,
} from "../../application/ports/vector.interface"
import { qdrant } from "@/infrastructure/database/qdrant/connect"

export class QdrantVectorStore implements IVectorStore {
  async upsert(chunks: VectorChunk[]): Promise<void> {
    await qdrant.upsert(VECTOR_COLLECTIONS.KNOWLEDGE_DOCUMENT, {
      wait: true,

      points: chunks.map((chunk) => ({
        id: chunk.id,

        vector: chunk.vector,

        payload: {
          content: chunk.content,
          documentId: chunk.documentId,
          metadata: chunk.metadata,
        },
      })),
    })
  }
  async deleteByDocumentId(documentId: string): Promise<void> {
    await qdrant.delete(VECTOR_COLLECTIONS.KNOWLEDGE_DOCUMENT, {
      wait: true,
      filter: {
        must: [
          {
            key: "documentId",
            match: {
              value: documentId,
            },
          },
        ],
      },
    })
  }
  async search(embedding: number[], options: VectorSearchOptions): Promise<RetrievedChunk[]> {
    const filterConditions: Record<string, unknown>[] = []

    if (options.filter?.documentId) {
      filterConditions.push({ key: "documentId", match: { value: options.filter.documentId } })
    }
    if (options.filter?.category) {
      filterConditions.push({ key: "metadata.category", match: { value: options.filter.category } })
    }
    if (options.filter?.locale) {
      filterConditions.push({ key: "metadata.locale", match: { value: options.filter.locale } })
    }

    const filter = filterConditions.length > 0 ? { must: filterConditions } : undefined

    const results = await qdrant.query(VECTOR_COLLECTIONS.KNOWLEDGE_DOCUMENT, {
      query: embedding,
      limit: options.limit,
      score_threshold: options.minScore,
      filter: filter,
      with_payload: true,
    })

    interface QdrantPoint {
      id: string | number
      score: number
      payload?: Record<string, unknown>
    }

    return (results.points as QdrantPoint[]).map((result) => ({
      id: String(result.id),
      score: result.score,
      payload: {
        documentId: result.payload?.documentId as string,
        content: result.payload?.content as string,
        metadata: result.payload?.metadata as VectorChunkMetadata,
      },
    }))
  }
}
